import { Controller, Post, Body, HttpException, HttpStatus, Req, RawBody } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import prisma from 'lib/prisma';
import { Request } from 'express';

// DTO for order items
class OrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;
}

// DTO for creating order and getting clientSecret
class CreatePaymentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

// DTO for confirming payment (for Postman testing)
class ConfirmPaymentDto {
  @IsString()
  clientSecret: string;

  @IsString()
  @IsOptional()
  testToken?: string; // For Postman testing: "tok_visa"
}

@ApiTags('Stripe - Payments')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  /**
   * STEP 1: Create Order and get clientSecret
   * - Backend creates order, calculates amount from database
   * - Returns clientSecret for frontend to complete payment with Stripe.js
   */
  @Post('create-payment')
  @ApiOperation({ 
    summary: 'Create order and get clientSecret',
    description: 'Creates order, returns clientSecret. Frontend uses this with Stripe.js to complete payment. Amount comes from database (secure).'
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 200, description: 'Order created, clientSecret returned' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async createPayment(@Body() createPaymentDto: CreatePaymentDto, @Req() req: Request) {
    try {
      const userId = (req.user as any)?.id || 1; // Get from JWT in production
      let totalPrice = 0;

      // 1. Verify products and calculate total from DATABASE (secure!)
      for (const item of createPaymentDto.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        
        if (!product) {
          throw new HttpException(`Product ${item.productId} not found`, HttpStatus.NOT_FOUND);
        }
        
        totalPrice += Number(product.price) * item.quantity;
      }

      // 2. Create order in database
      const order = await prisma.order.create({
        data: {
          clientId: userId,
          total: totalPrice,
          status: 'PENDING',
          items: {
            create: createPaymentDto.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });

      // 3. Create PaymentIntent with Stripe (amount from database, NOT from client!)
      const stripe = this.stripeService.getStripeInstance();
      const amountInCents = Math.round(totalPrice * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: { orderId: order.id.toString() },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      // 4. Save paymentIntentId to order
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentIntentId: paymentIntent.id },
      });

      // 5. Return clientSecret to frontend
      return {
        success: true,
        message: 'Order created! Use clientSecret with Stripe.js to complete payment.',
        order: {
          id: order.id,
          total: totalPrice,
          items: order.items.map(item => ({
            product: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
        // 🔑 This is what frontend needs
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * STEP 2 (Postman Testing): Confirm payment with clientSecret
   * - In production, frontend uses Stripe.js directly
   * - This endpoint is for testing from Postman
   */
  @Post('confirm-payment')
  @ApiOperation({ 
    summary: 'Confirm payment (for Postman testing)',
    description: 'Use clientSecret from create-payment to complete payment. In production, frontend uses Stripe.js instead.'
  })
  @ApiBody({ type: ConfirmPaymentDto })
  @ApiResponse({ status: 200, description: 'Payment confirmed' })
  @ApiResponse({ status: 400, description: 'Payment failed' })
  async confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    try {
      const stripe = this.stripeService.getStripeInstance();

      // Extract PaymentIntent ID from clientSecret
      const paymentIntentId = confirmPaymentDto.clientSecret.split('_secret_')[0];

      // Create PaymentMethod from test token
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: { token: confirmPaymentDto.testToken || 'tok_visa' },
      });

      // Confirm the PaymentIntent
      const confirmParams: any = { payment_method: paymentMethod.id };
      // If the PaymentIntent may require a redirect-based payment method (3DS, etc.)
      // we must provide a return_url so Stripe can redirect the customer back.
      if (process.env.STRIPE_RETURN_URL) {
        confirmParams.return_url = process.env.STRIPE_RETURN_URL;
      }

      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, confirmParams);

      // Update order status if payment succeeded
      if (paymentIntent.status === 'succeeded') {
        const orderId = parseInt(paymentIntent.metadata.orderId);
        
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        });

        return {
          success: true,
          message: 'Payment successful!',
          paymentIntent: {
            id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
          },
        };
      }

      return {
        success: false,
        message: 'Payment not completed',
        status: paymentIntent.status,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Webhook: Stripe sends payment events here
   * - Called automatically by Stripe after payment
   * - Updates order status based on payment result
   */
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook for payment events' })
  async handleWebhook(@RawBody() rawBody: Buffer, @Req() req: Request) {
    const stripe = this.stripeService.getStripeInstance();
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as any;
        const orderId = parseInt(paymentIntent.metadata.orderId);
        
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        });
        
        console.log(`✅ Payment succeeded for order #${orderId}`);
      }

      if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as any;
        const orderId = parseInt(paymentIntent.metadata.orderId);
        
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
        });
        
        console.log(`❌ Payment failed for order #${orderId}`);
      }

      return { received: true };
    } catch (error) {
      throw new HttpException(`Webhook error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get test tokens for Postman testing
   */
  @Post('test-tokens')
  @ApiOperation({ summary: 'Get list of Stripe test tokens' })
  @ApiResponse({ status: 200, description: 'List of test tokens' })
  getTestTokens() {
    return {
      testTokens: [
        { token: 'tok_visa', description: 'Visa - Success' },
        { token: 'tok_mastercard', description: 'Mastercard - Success' },
        { token: 'tok_amex', description: 'American Express - Success' },
        { token: 'tok_chargeDeclined', description: 'Card Declined' },
        { token: 'tok_chargeDeclinedInsufficientFunds', description: 'Insufficient Funds' },
        { token: 'tok_chargeDeclinedExpiredCard', description: 'Expired Card' },
      ],
      flow: {
        step1: {
          endpoint: 'POST /stripe/create-payment',
          body: { items: [{ productId: 1, quantity: 2 }] },
          returns: 'clientSecret',
        },
        step2: {
          endpoint: 'POST /stripe/confirm-payment',
          body: { clientSecret: 'pi_xxx_secret_xxx', testToken: 'tok_visa' },
        },
      },
      note: 'In production, frontend uses Stripe.js with clientSecret instead of confirm-payment endpoint',
    };
  }
}
