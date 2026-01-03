# 🚀 Cheat Sheet - Tests NestJS

## 📋 Commandes Rapides

```bash
# Tests
npm test                          # Lancer tous les tests
npm run test:watch               # Mode watch (auto-reload)
npm run test:cov                 # Avec couverture
npm run test:e2e                 # Tests E2E uniquement
npm test -- file.spec.ts         # Fichier spécifique
npm test -- --onlyChanged        # Tests modifiés uniquement

# Déboguer
npm test -- --verbose            # Mode verbose
npm test -- --detectOpenHandles  # Détecter les handles ouverts
npm run test:debug               # Mode debug
```

---

## 🎯 Syntaxe de Base

### Structure d'un Test

```typescript
describe('Module', () => {           // Groupe de tests
  beforeAll(() => {});              // Avant tous les tests
  afterAll(() => {});               // Après tous les tests
  beforeEach(() => {});             // Avant chaque test
  afterEach(() => {});              // Après chaque test

  it('description', () => {         // Un test
    expect(value).toBe(expected);   // Assertion
  });

  it.only('ce test uniquement', () => {}); // Lancer uniquement ce test
  it.skip('test ignoré', () => {});        // Ignorer ce test
});
```

---

## ✅ Matchers (Assertions)

### Égalité

```typescript
expect(value).toBe(5)                    // Égalité stricte (===)
expect(value).toEqual({ a: 1 })          // Égalité profonde
expect(value).not.toBe(5)                // Négation
```

### Vérité

```typescript
expect(value).toBeTruthy()               // Vrai
expect(value).toBeFalsy()                // Faux
expect(value).toBeDefined()              // Défini
expect(value).toBeUndefined()            // Non défini
expect(value).toBeNull()                 // Null
```

### Nombres

```typescript
expect(value).toBeGreaterThan(10)        // > 10
expect(value).toBeGreaterThanOrEqual(10) // >= 10
expect(value).toBeLessThan(10)           // < 10
expect(value).toBeLessThanOrEqual(10)    // <= 10
expect(value).toBeCloseTo(10.5, 1)       // Proche de (décimales)
```

### Strings

```typescript
expect(str).toMatch(/pattern/)           // Regex
expect(str).toContain('substring')       // Contient
expect(str).toHaveLength(5)              // Longueur
```

### Tableaux

```typescript
expect(arr).toContain('item')            // Contient l'élément
expect(arr).toHaveLength(3)              // Longueur
expect(arr).toEqual([1, 2, 3])           // Égalité
```

### Objets

```typescript
expect(obj).toHaveProperty('key')        // A la propriété
expect(obj).toHaveProperty('key', 'val') // Propriété avec valeur
expect(obj).toMatchObject({ a: 1 })      // Correspond partiellement
```

### Erreurs

```typescript
expect(() => fn()).toThrow()             // Lance une erreur
expect(() => fn()).toThrow('message')    // Avec message
expect(() => fn()).toThrow(Error)        // Type d'erreur
```

### Promesses

```typescript
await expect(promise).resolves.toBe(5)   // Résout avec valeur
await expect(promise).rejects.toThrow()  // Rejette avec erreur
```

---

## 🎭 Mocking

### Mock Simple

```typescript
const mockFn = jest.fn()                 // Créer un mock
mockFn.mockReturnValue(42)               // Retourner une valeur
mockFn.mockResolvedValue(42)             // Retourner une promesse
mockFn.mockRejectedValue(new Error())    // Rejeter une promesse

expect(mockFn).toHaveBeenCalled()        // A été appelé
expect(mockFn).toHaveBeenCalledTimes(2)  // Appelé 2 fois
expect(mockFn).toHaveBeenCalledWith(arg) // Appelé avec argument
```

### Mock Prisma

```typescript
jest.mock('lib/prisma', () => ({
  __esModule: true,
  default: {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import prisma from 'lib/prisma';

(prisma.product.findMany as jest.Mock).mockResolvedValue([...]);
```

### Mock Redis

```typescript
const redisMock = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const module = await Test.createTestingModule({
  providers: [
    Service,
    { provide: REDIS_CLIENT, useValue: redisMock },
  ],
}).compile();
```

---

## 🏗️ Test Unitaire (Service)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create item', async () => {
    const result = await service.create({ name: 'Test' });
    expect(result).toHaveProperty('id');
  });
});
```

---

## 🌐 Test E2E (API)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/endpoint (GET)', () => {
    return request(app.getHttpServer())
      .get('/endpoint')
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
      });
  });

  it('/endpoint (POST)', () => {
    return request(app.getHttpServer())
      .post('/endpoint')
      .send({ name: 'Test' })
      .set('Authorization', 'Bearer token')
      .expect(201);
  });
});
```

---

## 🔧 Configuration Jest

### package.json

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

### jest.config.js (Avancé)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## 📊 Couverture de Code

```bash
npm run test:cov
```

**Résultat :**

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.71 |    66.67 |     100 |   85.71 |
 products.service   |   85.71 |    66.67 |     100 |   85.71 |
 orders.service     |   92.30 |    75.00 |     100 |   92.30 |
--------------------|---------|----------|---------|---------|
```

**Objectif :** > 80% partout

---

## 🎯 Patterns Courants

### AAA Pattern

```typescript
it('should do something', () => {
  // Arrange (Préparer)
  const input = { name: 'Test' };
  
  // Act (Exécuter)
  const result = service.create(input);
  
  // Assert (Vérifier)
  expect(result).toBeDefined();
});
```

### Given-When-Then

```typescript
it('should calculate discount', () => {
  // Given (Étant donné)
  const price = 100;
  const discount = 10;
  
  // When (Quand)
  const result = calculateDiscount(price, discount);
  
  // Then (Alors)
  expect(result).toBe(90);
});
```

---

## 🐛 Déboguer les Tests

### Console.log

```typescript
it('debug test', () => {
  console.log('Value:', value);
  expect(value).toBeDefined();
});
```

### Debugger

```typescript
it('debug test', () => {
  debugger; // Point d'arrêt
  expect(value).toBeDefined();
});
```

### Lancer en mode debug

```bash
npm run test:debug
```

Puis ouvrir `chrome://inspect` dans Chrome

---

## 📝 Exemples Rapides

### Test Simple

```typescript
it('2 + 2 = 4', () => {
  expect(2 + 2).toBe(4);
});
```

### Test Async

```typescript
it('async test', async () => {
  const result = await service.findAll();
  expect(result).toHaveLength(3);
});
```

### Test avec Mock

```typescript
it('mock test', async () => {
  mockPrisma.product.findMany.mockResolvedValue([
    { id: 1, name: 'Product 1' },
  ]);
  
  const result = await service.findAll();
  expect(result).toHaveLength(1);
});
```

### Test E2E

```typescript
it('GET /products', () => {
  return request(app.getHttpServer())
    .get('/products')
    .expect(200);
});
```

---

## 🎨 Astuces

### Lancer un seul test

```typescript
it.only('ce test uniquement', () => {
  expect(true).toBe(true);
});
```

### Ignorer un test

```typescript
it.skip('test ignoré', () => {
  expect(true).toBe(true);
});
```

### Tests paramétrés

```typescript
const cases = [
  [1, 2, 3],
  [2, 3, 5],
  [5, 5, 10],
];

cases.forEach(([a, b, expected]) => {
  it(`${a} + ${b} = ${expected}`, () => {
    expect(a + b).toBe(expected);
  });
});
```

### Timeout personnalisé

```typescript
it('long test', async () => {
  // Test qui prend du temps
}, 10000); // 10 secondes
```

---

## 🚦 Bonnes Pratiques

✅ **DO**
- Un test = Une chose
- Noms descriptifs
- Tests indépendants
- Mock les dépendances externes
- Nettoyer après les tests

❌ **DON'T**
- Tests dépendants les uns des autres
- Utiliser la vraie DB dans les tests unitaires
- Tests trop longs
- Ignorer les tests qui échouent
- Tester les détails d'implémentation

---

## 📚 Ressources

- [Jest Docs](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 🎯 Checklist

- [ ] Tests unitaires pour tous les services
- [ ] Tests E2E pour tous les endpoints
- [ ] Couverture > 80%
- [ ] Tests passent en CI/CD
- [ ] Pas de tests ignorés (skip)
- [ ] Documentation des tests complexes

---

**Bon courage ! 🚀**
