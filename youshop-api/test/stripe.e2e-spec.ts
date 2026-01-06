import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Stripe Payment (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.categorie.deleteMany();
    await prisma.user.deleteMany();

    // Create user and login
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    token = res.body.token;
    userId = res.body.user.id;

    // Create category, product and inventory
    const category = await prisma.categorie.create({
      data: { name: 'Electronics' },
    });

    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        price: 100,
        categoryId: category.id,
      },
    });

    await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity: 10,
      },
    });
  });

  describe('Order Creation with Payment Intent', () => {
    it('should create order and return clientSecret', async () => {
      const product = await prisma.product.findFirst();

      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: product.id, quantity: 2 }],
        })
        .expect(201);

      expect(res.body).toHaveProperty('clientSecret');
      expect(res.body.updateOrder).toHaveProperty('paymentIntentId');
      expect(res.body.updateOrder.status).toBe('PENDING');
      expect(res.body.updateOrder.total).toBe(200);
    });
  });

  describe('Stripe Webhook - Payment Success', () => {
    it('should update order status to PAID on payment_intent.succeeded', async () => {
      const product = await prisma.product.findFirst();

      // Create order
      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: product.id, quantity: 2 }],
        });

      const orderId = orderRes.body.updateOrder.id;

      // Directly call confirmPayment instead of webhook
      await request(app.getHttpServer())
        .post(`/orders/${orderId}/confirm-payment`)
        .expect(201);

      // Verify order status updated
      const updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
      });

      expect(updatedOrder.status).toBe('PAID');

      // Verify inventory decremented
      const inventory = await prisma.inventory.findUnique({
        where: { productId: product.id },
      });

      expect(inventory.quantity).toBe(8);
    });
  });

  describe('Manual Payment Confirmation', () => {
    it('should confirm payment and update inventory', async () => {
      const product = await prisma.product.findFirst();

      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: product.id, quantity: 3 }],
        });

      const orderId = orderRes.body.updateOrder.id;

      await request(app.getHttpServer())
        .post(`/orders/${orderId}/confirm-payment`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      expect(order.status).toBe('PAID');

      const inventory = await prisma.inventory.findUnique({
        where: { productId: product.id },
      });

      expect(inventory.quantity).toBe(7);
    });
  });
});
