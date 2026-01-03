# 📚 Guide des Tests - YouShop API

## 🎯 Les Bases

### 1. Test Unitaire Simple

```typescript
describe('MaFonction', () => {
  it('devrait retourner 5 quand on additionne 2 + 3', () => {
    // Arrange (Préparer)
    const a = 2;
    const b = 3;
    
    // Act (Exécuter)
    const resultat = a + b;
    
    // Assert (Vérifier)
    expect(resultat).toBe(5);
  });
});
```

### 2. Les Matchers (Vérifications)

```typescript
// Égalité
expect(value).toBe(5);                    // Égalité stricte
expect(value).toEqual({ name: 'test' });  // Égalité d'objets

// Vérité
expect(value).toBeTruthy();               // Vrai
expect(value).toBeFalsy();                // Faux
expect(value).toBeDefined();              // Défini
expect(value).toBeNull();                 // Null

// Nombres
expect(value).toBeGreaterThan(10);        // Plus grand que
expect(value).toBeLessThan(20);           // Plus petit que

// Tableaux
expect(array).toContain('item');          // Contient
expect(array).toHaveLength(3);            // Longueur

// Objets
expect(obj).toHaveProperty('name');       // A la propriété
```

## 🔧 Mocking (Simuler des données)

### Mock Simple

```typescript
const mockFunction = jest.fn();
mockFunction.mockReturnValue('résultat');

const result = mockFunction();
expect(result).toBe('résultat');
expect(mockFunction).toHaveBeenCalled();
```

### Mock avec Promesse

```typescript
const mockAsync = jest.fn();
mockAsync.mockResolvedValue({ id: 1, name: 'Test' });

const result = await mockAsync();
expect(result).toEqual({ id: 1, name: 'Test' });
```

### Mock d'un Service

```typescript
const mockPrisma = {
  product: {
    findMany: jest.fn().mockResolvedValue([
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' },
    ]),
  },
};
```

## 🏗️ Structure d'un Test NestJS

### Test Unitaire d'un Service

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MonService } from './mon.service';

describe('MonService', () => {
  let service: MonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonService],
    }).compile();

    service = module.get<MonService>(MonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('devrait créer un produit', async () => {
    const produit = { name: 'Test', price: 100 };
    const result = await service.create(produit);
    
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Test');
  });
});
```

### Test E2E d'un Controller

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Products (e2e)', () => {
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

  it('/products (GET)', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/products (POST)', () => {
    return request(app.getHttpServer())
      .post('/products')
      .send({ name: 'Test', price: 100 })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
      });
  });
});
```

## 🎭 Hooks (Lifecycle)

```typescript
describe('Tests avec Hooks', () => {
  beforeAll(() => {
    // Exécuté UNE FOIS avant tous les tests
    console.log('Début de tous les tests');
  });

  afterAll(() => {
    // Exécuté UNE FOIS après tous les tests
    console.log('Fin de tous les tests');
  });

  beforeEach(() => {
    // Exécuté AVANT chaque test
    console.log('Avant un test');
  });

  afterEach(() => {
    // Exécuté APRÈS chaque test
    console.log('Après un test');
  });

  it('test 1', () => {
    expect(true).toBe(true);
  });

  it('test 2', () => {
    expect(true).toBe(true);
  });
});
```

## 🚀 Commandes

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch (auto-reload)
npm run test:watch

# Lancer les tests avec couverture
npm run test:cov

# Lancer les tests E2E
npm run test:e2e

# Lancer un fichier spécifique
npm test -- products.service.spec.ts
```

## 📝 Exemple Complet : Tester un CRUD

```typescript
describe('ProductsService CRUD', () => {
  let service: ProductsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      product: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('create', () => {
    it('devrait créer un produit', async () => {
      const dto = { name: 'Test', price: 100 };
      const expected = { id: 1, ...dto };
      
      mockPrisma.product.create.mockResolvedValue(expected);
      
      const result = await service.create(dto);
      
      expect(result).toEqual(expected);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('findAll', () => {
    it('devrait retourner tous les produits', async () => {
      const expected = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
      ];
      
      mockPrisma.product.findMany.mockResolvedValue(expected);
      
      const result = await service.findAll();
      
      expect(result).toEqual(expected);
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('devrait retourner un produit par ID', async () => {
      const expected = { id: 1, name: 'Product 1' };
      
      mockPrisma.product.findUnique.mockResolvedValue(expected);
      
      const result = await service.findOne(1);
      
      expect(result).toEqual(expected);
    });

    it('devrait retourner null si non trouvé', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      
      const result = await service.findOne(999);
      
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('devrait mettre à jour un produit', async () => {
      const dto = { name: 'Updated' };
      const expected = { id: 1, name: 'Updated', price: 100 };
      
      mockPrisma.product.update.mockResolvedValue(expected);
      
      const result = await service.update(1, dto);
      
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('devrait supprimer un produit', async () => {
      const expected = { id: 1, name: 'Deleted' };
      
      mockPrisma.product.delete.mockResolvedValue(expected);
      
      const result = await service.remove(1);
      
      expect(result).toEqual(expected);
    });
  });
});
```

## 🎯 Bonnes Pratiques

1. **Un test = Une chose** : Chaque test doit vérifier UNE seule chose
2. **Noms descriptifs** : `it('devrait créer un produit avec succès')`
3. **AAA Pattern** : Arrange, Act, Assert
4. **Nettoyer après** : Utiliser `afterEach` pour nettoyer
5. **Isoler les tests** : Chaque test doit être indépendant
6. **Mock les dépendances** : Ne pas utiliser la vraie DB dans les tests unitaires

## 🐛 Déboguer les Tests

```typescript
// Afficher dans la console
it('debug test', () => {
  const value = { name: 'test' };
  console.log('Value:', value);
  expect(value).toBeDefined();
});

// Utiliser .only pour lancer un seul test
it.only('ce test uniquement', () => {
  expect(true).toBe(true);
});

// Ignorer un test
it.skip('test ignoré', () => {
  expect(true).toBe(true);
});
```

## 📊 Couverture de Code

La couverture montre quel % de ton code est testé :

```bash
npm run test:cov
```

Résultat :
```
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|--------
service.ts|   85.71 |    66.67 |     100 |   85.71
```

Objectif : > 80% de couverture

---

## 🎓 Exercice Pratique

Essaie de créer un test pour `CategorieService` :

```typescript
describe('CategorieService', () => {
  // TODO: Créer les tests pour :
  // 1. create() - créer une catégorie
  // 2. findAll() - lister toutes les catégories
  // 3. findOne() - trouver une catégorie par ID
  // 4. update() - mettre à jour une catégorie
  // 5. remove() - supprimer une catégorie
});
```

Bon courage ! 🚀
