import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import prisma from 'lib/prisma';
import { REDIS_CLIENT } from '../products/redis.module';
import Redis from 'ioredis';
import { StripeService } from 'src/stripe/stripe.service';
import { Stripe } from 'stripe';


@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis,
  @Inject(StripeService) private readonly stripeService: StripeService) {}

  async onModuleInit() {
    this.startExpirationListener();
  }

  private startExpirationListener() {
    const subscriber = this.redis.duplicate();
    subscriber.config('SET', 'notify-keyspace-events', 'Ex');
    subscriber.psubscribe('__keyevent@0__:expired');
    
    subscriber.on('pmessage', async (pattern, channel, expiredKey) => {
      if (expiredKey.startsWith('order:')) {
        const orderId = parseInt(expiredKey.split(':')[1]);
        try {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
          });
          
          if (order && order.status === 'PENDING') {
            this.logger.warn(`⏰ Order #${orderId} EXPIRED - Releasing stock`, Date.now().toString());
            
            await prisma.order.update({
              where: { id: orderId },
              data: { status: 'expired' }
            });
            
            for (const item of order.items) {
              await this.redis.decrby(`product:${item.productId}:reserved`, item.quantity);
            }
            
            this.logger.log(`✅ Order #${orderId} status changed to expired`, Date.now().toString());
          }
        } catch (error) {
          this.logger.error(`Error handling expired order ${orderId}:`, error);
        }
      }
    });
  }

  async create(userId: number, createOrderData: any) {
    let totalPrice = 0;

    // Verify all products exist and check inventory
    for (const item of createOrderData) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { inventory: true },
      });
      
      if (!product) {
        throw new Error(`Product with ID ${item.productId} does not exist`);
      }
      
      if (!product.inventory) {
        throw new Error(`Product "${product.name}" has no inventory`);
      }

      // Get reserved quantity from Redis
      const reservedQty = await this.redis.get(`product:${item.productId}:reserved`);
      const reserved = reservedQty ? parseInt(reservedQty) : 0;
      const availableQty = product.inventory.quantity - reserved;
      
      if (availableQty < item.quantity) {
        throw new Error(`Insufficient stock for product "${product.name}". Available: ${availableQty}, Requested: ${item.quantity}`);
      }

      // Calculate total price
      totalPrice += product.price * item.quantity;
    }
    
    // Create order
    const order = await prisma.order.create({
      data: {
        clientId: userId,
        total: totalPrice,
        items: {
          create: createOrderData.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const paymentIntent = await this.stripeService.createPaymentIntent(totalPrice * 100, 'usd', { orderId: order.id.toString() });
    
   const updateOrder = await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: paymentIntent.id },
    });
   

    // Reserve products in Redis
    for (const item of createOrderData) {
      await this.redis.incrby(`product:${item.productId}:reserved`, item.quantity);
      await this.redis.expire(`product:${item.productId}:reserved`, 1200); // 20 min
    }

    // Store order in Redis with 20 min expiration
    await this.redis.setex(
      `order:${order.id}`,
      1200,
      JSON.stringify(order)
    );

    return { updateOrder, clientSecret: paymentIntent.client_secret  };
  }

  async findAll() {
    return prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async update(id: number, updateOrderData: any) {
    return prisma.order.update({
      where: { id },
      data: updateOrderData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    return prisma.order.delete({
      where: { id },
    });
  }

  async confirmPayment(orderId: number) {
    const orderInRedis = await this.redis.get(`order:${orderId}`);
    
    if (!orderInRedis) {
      throw new Error('Order expired or already paid');
    }

    const order = JSON.parse(orderInRedis);

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' }
    });

    for (const item of order.items) {
      await prisma.inventory.update({
        where: { productId: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
      await this.redis.decrby(`product:${item.productId}:reserved`, item.quantity);
    }

    await this.redis.del(`order:${orderId}`);

    return { message: 'Payment confirmed, inventory updated' };
  }

  private constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
    return this.stripeService.getStripeInstance().webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    const event = this.constructEvent(rawBody, signature);
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = parseInt(paymentIntent.metadata?.orderId || '0');
      
      if (orderId) {
        await this.confirmPayment(orderId);
        
      }
    }
    
    return { received: true };
  }
}
