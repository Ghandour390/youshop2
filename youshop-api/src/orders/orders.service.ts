import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import prisma from 'lib/prisma';
import { REDIS_CLIENT } from '../products/redis.module';
import Redis from 'ioredis';


@Injectable()
export class OrdersService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

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

    setTimeout(async () => {
      const orderInRedis = await this.redis.get(`order:${order.id}`);
      if (orderInRedis) {
        const orderData = JSON.parse(orderInRedis);
        for (const item of orderData.items) {
          await this.redis.decrby(`product:${item.productId}:reserved`, item.quantity);
        }
        await this.redis.del(`order:${order.id}`);
        
        // Delete order from database
        await prisma.order.delete({
          where: { id: order.id },
        });
      }
    }, 1200000);

    return order;
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
    // Check if order exists in Redis
    const orderInRedis = await this.redis.get(`order:${orderId}`);
    
    if (!orderInRedis) {
      throw new Error('Order expired or already paid');
    }

    const order = JSON.parse(orderInRedis);

    // Update inventory for each product
    for (const item of order.items) {
      await prisma.inventory.update({
        where: { productId: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
      // Release reserved quantity from Redis
      await this.redis.decrby(`product:${item.productId}:reserved`, item.quantity);
    }

    // Delete order from Redis
    await this.redis.del(`order:${orderId}`);

    return { message: 'Payment confirmed, inventory updated' };
  }
}
