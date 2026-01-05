import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-12-15.clover',
        });
    }
    async createPaymentIntent(amount: number, currency: string, metadata?: Stripe.MetadataParam): Promise<Stripe.PaymentIntent> {
        return this.stripe.paymentIntents.create({
            amount,
            currency,
            metadata,
        });
    }
}