# 🎯 Exercices Pratiques - Tests

## Exercice 1 : Tests Simples (Débutant)

### Créer un fichier `math.service.ts`

```typescript
export class MathService {
  add(a: number, b: number): number {
    return a + b;
  }

  subtract(a: number, b: number): number {
    return a - b;
  }

  multiply(a: number, b: number): number {
    return a * b;
  }

  divide(a: number, b: number): number {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }
}
```

### À faire : Créer `math.service.spec.ts`

```typescript
import { MathService } from './math.service';

describe('MathService', () => {
  let service: MathService;

  beforeEach(() => {
    service = new MathService();
  });

  // TODO: Test 1 - Vérifier que 2 + 3 = 5
  it('devrait additionner deux nombres', () => {
    // Ton code ici
  });

  // TODO: Test 2 - Vérifier que 10 - 4 = 6
  it('devrait soustraire deux nombres', () => {
    // Ton code ici
  });

  // TODO: Test 3 - Vérifier que 5 * 3 = 15
  it('devrait multiplier deux nombres', () => {
    // Ton code ici
  });

  // TODO: Test 4 - Vérifier que 10 / 2 = 5
  it('devrait diviser deux nombres', () => {
    // Ton code ici
  });

  // TODO: Test 5 - Vérifier qu'une erreur est lancée si division par 0
  it('devrait lancer une erreur si division par zéro', () => {
    // Ton code ici
    // Indice : expect(() => service.divide(10, 0)).toThrow();
  });
});
```

---

## Exercice 2 : Tester un Service avec Mock (Intermédiaire)

### Créer `categorie.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CategorieService } from './categorie.service';

// TODO: Mock Prisma
jest.mock('lib/prisma', () => ({
  __esModule: true,
  default: {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import prisma from 'lib/prisma';

describe('CategorieService', () => {
  let service: CategorieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategorieService],
    }).compile();

    service = module.get<CategorieService>(CategorieService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // TODO: Test 1 - Créer une catégorie
  describe('create', () => {
    it('devrait créer une nouvelle catégorie', async () => {
      const dto = { name: 'Electronics' };
      const expected = { id: 1, name: 'Electronics' };

      // Mock la réponse de Prisma
      (prisma.category.create as jest.Mock).mockResolvedValue(expected);

      // Appeler la méthode
      const result = await service.create(dto);

      // Vérifications
      expect(result).toEqual(expected);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  // TODO: Test 2 - Lister toutes les catégories
  describe('findAll', () => {
    it('devrait retourner toutes les catégories', async () => {
      // Ton code ici
      // Indice : Mock un tableau de catégories
    });
  });

  // TODO: Test 3 - Trouver une catégorie par ID
  describe('findOne', () => {
    it('devrait retourner une catégorie par ID', async () => {
      // Ton code ici
    });

    it('devrait retourner null si non trouvée', async () => {
      // Ton code ici
    });
  });

  // TODO: Test 4 - Mettre à jour une catégorie
  describe('update', () => {
    it('devrait mettre à jour une catégorie', async () => {
      // Ton code ici
    });
  });

  // TODO: Test 5 - Supprimer une catégorie
  describe('remove', () => {
    it('devrait supprimer une catégorie', async () => {
      // Ton code ici
    });
  });
});
```

---

## Exercice 3 : Test E2E (Avancé)

### Créer `categorie.e2e-spec.ts` dans le dossier `test/`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Categorie (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();

    // TODO: S'authentifier pour obtenir un token
    // Indice : Utilise request(app.getHttpServer()).post('/auth/register')
  });

  afterAll(async () => {
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.category.deleteMany();
  });

  // TODO: Test 1 - Créer une catégorie
  describe('/categorie (POST)', () => {
    it('devrait créer une nouvelle catégorie', () => {
      // Ton code ici
      // Indice : return request(app.getHttpServer()).post('/categorie')...
    });
  });

  // TODO: Test 2 - Lister les catégories
  describe('/categorie (GET)', () => {
    it('devrait retourner toutes les catégories', async () => {
      // Créer d'abord quelques catégories dans la DB
      await prisma.category.create({ data: { name: 'Cat 1' } });
      await prisma.category.create({ data: { name: 'Cat 2' } });

      // Ton code ici pour tester le GET
    });
  });

  // TODO: Test 3 - Récupérer une catégorie par ID
  describe('/categorie/:id (GET)', () => {
    it('devrait retourner une catégorie par ID', async () => {
      // Ton code ici
    });
  });

  // TODO: Test 4 - Mettre à jour une catégorie
  describe('/categorie/:id (PATCH)', () => {
    it('devrait mettre à jour une catégorie', async () => {
      // Ton code ici
    });
  });

  // TODO: Test 5 - Supprimer une catégorie
  describe('/categorie/:id (DELETE)', () => {
    it('devrait supprimer une catégorie', async () => {
      // Ton code ici
    });
  });
});
```

---

## Exercice 4 : Tester les Erreurs (Avancé)

### Créer des tests pour gérer les cas d'erreur

```typescript
describe('ProductsService - Error Handling', () => {
  let service: ProductsService;
  let mockPrisma: any;

  beforeEach(async () => {
    // Setup...
  });

  // TODO: Test 1 - Produit non trouvé
  it('devrait lancer une erreur si le produit n\'existe pas', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow('Product not found');
  });

  // TODO: Test 2 - Prix invalide
  it('devrait lancer une erreur si le prix est négatif', async () => {
    const dto = { name: 'Test', price: -10 };

    await expect(service.create(dto)).rejects.toThrow('Price must be positive');
  });

  // TODO: Test 3 - Catégorie invalide
  it('devrait lancer une erreur si la catégorie n\'existe pas', async () => {
    // Ton code ici
  });

  // TODO: Test 4 - Stock insuffisant
  it('devrait lancer une erreur si le stock est insuffisant', async () => {
    // Ton code ici
  });
});
```

---

## Exercice 5 : Test de Performance (Expert)

```typescript
describe('Performance Tests', () => {
  // TODO: Test 1 - Vérifier que findAll() prend moins de 1 seconde
  it('devrait récupérer tous les produits en moins de 1s', async () => {
    const start = Date.now();
    await service.findAll();
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000);
  });

  // TODO: Test 2 - Vérifier le cache Redis
  it('devrait utiliser le cache pour les requêtes répétées', async () => {
    // Première requête
    await service.findOne(1);
    
    // Deuxième requête (devrait utiliser le cache)
    await service.findOne(1);

    // Vérifier que Prisma n'a été appelé qu'une fois
    expect(mockPrisma.product.findUnique).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🎓 Solutions

<details>
<summary>Solution Exercice 1 - MathService</summary>

```typescript
describe('MathService', () => {
  let service: MathService;

  beforeEach(() => {
    service = new MathService();
  });

  it('devrait additionner deux nombres', () => {
    const result = service.add(2, 3);
    expect(result).toBe(5);
  });

  it('devrait soustraire deux nombres', () => {
    const result = service.subtract(10, 4);
    expect(result).toBe(6);
  });

  it('devrait multiplier deux nombres', () => {
    const result = service.multiply(5, 3);
    expect(result).toBe(15);
  });

  it('devrait diviser deux nombres', () => {
    const result = service.divide(10, 2);
    expect(result).toBe(5);
  });

  it('devrait lancer une erreur si division par zéro', () => {
    expect(() => service.divide(10, 0)).toThrow('Division by zero');
  });
});
```

</details>

---

## 📊 Checklist de Progression

- [ ] Exercice 1 : Tests simples (MathService)
- [ ] Exercice 2 : Tests avec mocks (CategorieService)
- [ ] Exercice 3 : Tests E2E (Categorie API)
- [ ] Exercice 4 : Gestion des erreurs
- [ ] Exercice 5 : Tests de performance

---

## 🚀 Commandes Utiles

```bash
# Lancer tous les tests
npm test

# Lancer un fichier spécifique
npm test -- math.service.spec.ts

# Lancer en mode watch
npm run test:watch

# Voir la couverture
npm run test:cov

# Tests E2E
npm run test:e2e
```

---

## 💡 Conseils

1. **Commence simple** : Fais d'abord l'exercice 1
2. **Lis les erreurs** : Les messages d'erreur te guident
3. **Compare avec les exemples** : Regarde les fichiers déjà créés
4. **Teste souvent** : Lance `npm run test:watch` pour voir les résultats en temps réel
5. **Demande de l'aide** : Si tu bloques, regarde les solutions

Bon courage ! 💪
