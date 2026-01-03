import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let categoryId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();

    // Créer une catégorie pour les tests
    const category = await prisma.category.create({
      data: { name: 'Test Category' },
    });
    categoryId = category.id;

    // S'authentifier pour obtenir un token
    const authRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });
    authToken = authRes.body.token;
  });

  afterAll(async () => {
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.product.deleteMany();
  });

  describe('/products (POST)', () => {
    it('should create a new product', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          categoryId: categoryId,
          quantity: 10,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Product');
          expect(res.body.price).toBe(99.99);
          expect(res.body).toHaveProperty('inventory');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 99.99,
        })
        .expect(401);
    });
  });

  describe('/products (GET)', () => {
    beforeEach(async () => {
      await prisma.product.create({
        data: {
          name: 'Product 1',
          price: 50,
          categoryId: categoryId,
          inventory: { create: { quantity: 5 } },
        },
      });
      await prisma.product.create({
        data: {
          name: 'Product 2',
          price: 100,
          categoryId: categoryId,
          inventory: { create: { quantity: 10 } },
        },
      });
    });

    it('should return all products', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('price');
        });
    });
  });

  describe('/products/:id (GET)', () => {
    it('should return a product by id', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Single Product',
          price: 75,
          categoryId: categoryId,
        },
      });

      return request(app.getHttpServer())
        .get(`/products/${product.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(product.id);
          expect(res.body.name).toBe('Single Product');
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/99999')
        .expect(404);
    });
  });

  describe('/products/:id (PATCH)', () => {
    it('should update a product', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Old Name',
          price: 50,
          categoryId: categoryId,
        },
      });

      return request(app.getHttpServer())
        .patch(`/products/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Name',
          price: 75,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('New Name');
          expect(res.body.price).toBe(75);
        });
    });
  });

  describe('/products/:id (DELETE)', () => {
    it('should delete a product', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'To Delete',
          price: 50,
          categoryId: categoryId,
        },
      });

      return request(app.getHttpServer())
        .delete(`/products/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deleted = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(deleted).toBeNull();
    });
  });
});
