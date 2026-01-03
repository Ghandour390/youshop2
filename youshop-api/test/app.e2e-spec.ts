import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('API E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Register and login
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });

    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('/auth/register (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@test.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
        })
        .expect(201);
    });

    it('/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });

    it('/auth/profile (GET)', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Categories', () => {
    let categoryId: number;

    it('/categories (POST)', () => {
      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Category' })
        .expect(201)
        .expect((res) => {
          categoryId = res.body.id;
        });
    });

    it('/categories (GET)', () => {
      return request(app.getHttpServer())
        .get('/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/categories/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(200);
    });

    it('/categories/:id (PUT)', () => {
      return request(app.getHttpServer())
        .put(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Category' })
        .expect(200);
    });
  });

  describe('Products', () => {
    let productId: number;

    it('/products (POST)', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          price: 99.99,
          categoryId: 1,
          quantity: 10,
        })
        .expect(201)
        .expect((res) => {
          productId = res.body.id;
        });
    });

    it('/products (GET)', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/products/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);
    });

    it('/products/:id (PATCH)', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ price: 89.99 })
        .expect(200);
    });
  });

  describe('Orders', () => {
    let orderId: number;

    it('/orders (POST)', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: 1, quantity: 2 }],
        })
        .expect(201)
        .expect((res) => {
          orderId = res.body.id;
        });
    });

    it('/orders (GET)', () => {
      return request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('/orders/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
