# 🎨 Patterns et Astuces Avancées - Tests

## 🏗️ Patterns de Tests

### 1. Factory Pattern (Créer des données de test)

```typescript
// test/factories/product.factory.ts
export class ProductFactory {
  static create(overrides = {}) {
    return {
      id: 1,
      name: 'Test Product',
      price: 100,
      description: 'Test Description',
      categoryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides = {}) {
    return Array.from({ length: count }, (_, i) =>
      this.create({ id: i + 1, ...overrides })
    );
  }
}

// Utilisation
it('should return products', async () => {
  const products = ProductFactory.createMany(3);
  mockPrisma.product.findMany.mockResolvedValue(products);
  
  const result = await service.findAll();
  expect(result).toHaveLength(3);
});
```

### 2. Builder Pattern (Construire des objets complexes)

```typescript
// test/builders/order.builder.ts
export class OrderBuilder {
  private order = {
    id: 1,
    clientId: 1,
    total: 0,
    items: [],
    status: 'PENDING',
  };

  withId(id: number) {
    this.order.id = id;
    return this;
  }

  withClient(clientId: number) {
    this.order.clientId = clientId;
    return this;
  }

  withItems(items: any[]) {
    this.order.items = items;
    this.order.total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return this;
  }

  withStatus(status: string) {
    this.order.status = status;
    return this;
  }

  build() {
    return this.order;
  }
}

// Utilisation
it('should create order', async () => {
  const order = new OrderBuilder()
    .withId(1)
    .withClient(5)
    .withItems([{ productId: 1, quantity: 2, price: 50 }])
    .withStatus('PAID')
    .build();

  mockPrisma.order.create.mockResolvedValue(order);
  
  const result = await service.create(order);
  expect(result.total).toBe(100);
});
```

### 3. Test Helpers (Fonctions utilitaires)

```typescript
// test/helpers/test.helpers.ts
export class TestHelpers {
  static async createAuthToken(app: INestApplication) {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    return response.body.token;
  }

  static async createCategory(prisma: PrismaService, name = 'Test Category') {
    return prisma.category.create({ data: { name } });
  }

  static async createProduct(prisma: PrismaService, overrides = {}) {
    const category = await this.createCategory(prisma);
    return prisma.product.create({
      data: {
        name: 'Test Product',
        price: 100,
        categoryId: category.id,
        ...overrides,
      },
    });
  }

  static async cleanDatabase(prisma: PrismaService) {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  }
}

// Utilisation
describe('Products E2E', () => {
  beforeAll(async () => {
    authToken = await TestHelpers.createAuthToken(app);
  });

  beforeEach(async () => {
    await TestHelpers.cleanDatabase(prisma);
  });
});
```

---

## 🎯 Patterns de Mocking

### 1. Mock Partiel

```typescript
// Mock seulement certaines méthodes
const mockPrisma = {
  product: {
    findMany: jest.fn(),
    // Les autres méthodes ne sont pas mockées
  },
} as any;
```

### 2. Mock avec Spy

```typescript
// Espionner une méthode réelle
const spy = jest.spyOn(service, 'findOne');
await service.findOne(1);

expect(spy).toHaveBeenCalledWith(1);
expect(spy).toHaveBeenCalledTimes(1);

spy.mockRestore(); // Restaurer la méthode originale
```

### 3. Mock avec Différentes Réponses

```typescript
// Retourner différentes valeurs à chaque appel
mockPrisma.product.findUnique
  .mockResolvedValueOnce({ id: 1, name: 'Product 1' })
  .mockResolvedValueOnce({ id: 2, name: 'Product 2' })
  .mockResolvedValueOnce(null);

await service.findOne(1); // Retourne Product 1
await service.findOne(2); // Retourne Product 2
await service.findOne(3); // Retourne null
```

### 4. Mock avec Implémentation Personnalisée

```typescript
mockPrisma.product.create.mockImplementation((args) => {
  return Promise.resolve({
    id: Math.random(),
    ...args.data,
  });
});
```

---

## 🧪 Tests Paramétrés

### Test avec Plusieurs Cas

```typescript
describe('calculateDiscount', () => {
  const testCases = [
    { price: 100, discount: 10, expected: 90 },
    { price: 200, discount: 20, expected: 160 },
    { price: 50, discount: 5, expected: 47.5 },
  ];

  testCases.forEach(({ price, discount, expected }) => {
    it(`should calculate ${discount}% discount on ${price}`, () => {
      const result = calculateDiscount(price, discount);
      expect(result).toBe(expected);
    });
  });
});
```

### Test avec describe.each

```typescript
describe.each([
  [100, 10, 90],
  [200, 20, 160],
  [50, 5, 47.5],
])('calculateDiscount(%i, %i)', (price, discount, expected) => {
  it(`should return ${expected}`, () => {
    const result = calculateDiscount(price, discount);
    expect(result).toBe(expected);
  });
});
```

---

## 🎭 Tests d'Intégration

### Tester Plusieurs Services Ensemble

```typescript
describe('Order Creation Flow', () => {
  let orderService: OrdersService;
  let productService: ProductsService;
  let inventoryService: InventoryService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OrdersService, ProductsService, InventoryService],
    }).compile();

    orderService = module.get(OrdersService);
    productService = module.get(ProductsService);
    inventoryService = module.get(InventoryService);
  });

  it('should create order and update inventory', async () => {
    // 1. Créer un produit
    const product = await productService.create({
      name: 'Test',
      price: 100,
      quantity: 10,
    });

    // 2. Créer une commande
    const order = await orderService.create(1, [
      { productId: product.id, quantity: 2 },
    ]);

    // 3. Vérifier l'inventaire
    const inventory = await inventoryService.findByProduct(product.id);
    expect(inventory.quantity).toBe(8); // 10 - 2
  });
});
```

---

## 🔍 Tests de Validation

### Tester les DTOs

```typescript
import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

describe('CreateProductDto', () => {
  it('should validate correct data', async () => {
    const dto = new CreateProductDto();
    dto.name = 'Test Product';
    dto.price = 100;
    dto.categoryId = 1;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail with invalid price', async () => {
    const dto = new CreateProductDto();
    dto.name = 'Test Product';
    dto.price = -10; // Prix négatif
    dto.categoryId = 1;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('price');
  });

  it('should fail with missing name', async () => {
    const dto = new CreateProductDto();
    dto.price = 100;
    dto.categoryId = 1;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
```

---

## ⏱️ Tests Asynchrones

### Tester les Timeouts

```typescript
it('should timeout after 5 seconds', async () => {
  jest.useFakeTimers();

  const promise = service.processOrder(1);
  
  // Avancer le temps de 5 secondes
  jest.advanceTimersByTime(5000);

  await expect(promise).rejects.toThrow('Timeout');

  jest.useRealTimers();
});
```

### Tester les Promesses

```typescript
it('should handle promise rejection', async () => {
  mockPrisma.product.create.mockRejectedValue(new Error('DB Error'));

  await expect(service.create({})).rejects.toThrow('DB Error');
});

it('should handle promise resolution', async () => {
  mockPrisma.product.create.mockResolvedValue({ id: 1 });

  const result = await service.create({});
  expect(result.id).toBe(1);
});
```

---

## 🎪 Tests de Guards et Middlewares

### Tester un Guard

```typescript
import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should allow authenticated user', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid-token' },
        }),
      }),
    } as ExecutionContext;

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny unauthenticated user', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow();
  });
});
```

---

## 📊 Tests de Performance

### Mesurer le Temps d'Exécution

```typescript
describe('Performance Tests', () => {
  it('should load 1000 products in less than 1 second', async () => {
    const start = performance.now();
    
    await service.findAll();
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000);
  });

  it('should handle concurrent requests', async () => {
    const promises = Array.from({ length: 100 }, () =>
      service.findOne(1)
    );

    const start = performance.now();
    await Promise.all(promises);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(2000);
  });
});
```

---

## 🐛 Tests de Cas Limites

```typescript
describe('Edge Cases', () => {
  it('should handle empty array', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    
    const result = await service.findAll();
    expect(result).toEqual([]);
  });

  it('should handle null value', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);
    
    const result = await service.findOne(999);
    expect(result).toBeNull();
  });

  it('should handle undefined value', async () => {
    const result = await service.create({ name: undefined });
    expect(result).toBeDefined();
  });

  it('should handle very large numbers', async () => {
    const result = await service.create({ price: Number.MAX_SAFE_INTEGER });
    expect(result.price).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('should handle special characters', async () => {
    const result = await service.create({ name: "Test's \"Product\"" });
    expect(result.name).toBe("Test's \"Product\"");
  });
});
```

---

## 🎯 Custom Matchers

### Créer des Matchers Personnalisés

```typescript
// test/matchers/custom-matchers.ts
expect.extend({
  toBeValidProduct(received) {
    const pass =
      received &&
      typeof received.id === 'number' &&
      typeof received.name === 'string' &&
      typeof received.price === 'number' &&
      received.price > 0;

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid product`
          : `Expected ${received} to be a valid product`,
    };
  },
});

// Utilisation
it('should return valid product', async () => {
  const result = await service.findOne(1);
  expect(result).toBeValidProduct();
});
```

---

## 🔄 Tests de Retry et Fallback

```typescript
describe('Retry Logic', () => {
  it('should retry 3 times on failure', async () => {
    mockPrisma.product.findUnique
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValueOnce({ id: 1, name: 'Success' });

    const result = await service.findOneWithRetry(1);
    
    expect(result.name).toBe('Success');
    expect(mockPrisma.product.findUnique).toHaveBeenCalledTimes(3);
  });

  it('should use fallback after max retries', async () => {
    mockPrisma.product.findUnique.mockRejectedValue(new Error('Always fail'));

    const result = await service.findOneWithFallback(1);
    
    expect(result).toEqual({ id: 1, name: 'Fallback Product' });
  });
});
```

---

## 📝 Bonnes Pratiques Avancées

### 1. Setup et Teardown Globaux

```typescript
// test/setup.ts
beforeAll(async () => {
  // Setup global
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Cleanup global
});
```

### 2. Grouper les Tests Logiquement

```typescript
describe('ProductsService', () => {
  describe('CRUD Operations', () => {
    describe('create', () => {
      it('should create with valid data', () => {});
      it('should fail with invalid data', () => {});
    });

    describe('read', () => {
      it('should find all', () => {});
      it('should find one', () => {});
    });
  });

  describe('Business Logic', () => {
    describe('discount calculation', () => {
      it('should apply discount', () => {});
    });
  });
});
```

### 3. Tests Lisibles

```typescript
// ❌ Mauvais
it('test 1', () => {
  expect(service.fn(1, 2)).toBe(3);
});

// ✅ Bon
it('should add two numbers correctly', () => {
  const result = service.add(1, 2);
  expect(result).toBe(3);
});
```

---

## 🚀 Optimisation des Tests

### 1. Parallélisation

```json
// package.json
{
  "scripts": {
    "test": "jest --maxWorkers=4"
  }
}
```

### 2. Cache

```json
// jest.config.js
module.exports = {
  cache: true,
  cacheDirectory: '.jest-cache',
};
```

### 3. Tests Sélectifs

```bash
# Lancer seulement les tests modifiés
npm test -- --onlyChanged

# Lancer seulement les tests liés à un fichier
npm test -- --findRelatedTests src/products/products.service.ts
```

---

Bon courage avec tes tests avancés ! 🚀
