# 🎨 Concepts Visuels - Tests

## 🏗️ Architecture des Tests

```
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION                          │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Controller  │  │  Controller  │  │  Controller  │ │
│  │   Products   │  │    Orders    │  │  Categories  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │         │
│         ▼                 ▼                  ▼         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Service    │  │   Service    │  │   Service    │ │
│  │   Products   │  │    Orders    │  │  Categories  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │         │
│         └─────────────────┼──────────────────┘         │
│                           ▼                            │
│                    ┌──────────────┐                    │
│                    │    Prisma    │                    │
│                    │   (Database) │                    │
│                    └──────────────┘                    │
└─────────────────────────────────────────────────────────┘

Tests Unitaires ──────────► Service (avec mocks)
Tests E2E ────────────────► Controller → Service → DB
```

---

## 🎯 Types de Tests

```
┌─────────────────────────────────────────────────────────┐
│                    PYRAMIDE DES TESTS                   │
│                                                         │
│                        ▲                                │
│                       ╱ ╲                               │
│                      ╱   ╲                              │
│                     ╱ E2E ╲         ← Peu, lents       │
│                    ╱───────╲                            │
│                   ╱         ╲                           │
│                  ╱Integration╲      ← Moyens           │
│                 ╱─────────────╲                         │
│                ╱               ╲                        │
│               ╱   Unit Tests    ╲   ← Beaucoup, rapides│
│              ╱───────────────────╲                      │
│             ╱_____________________╲                     │
│                                                         │
└─────────────────────────────────────────────────────────┘

Unit Tests (70%)      : Testent une fonction isolée
Integration Tests (20%): Testent plusieurs modules ensemble
E2E Tests (10%)       : Testent l'application complète
```

---

## 🔄 Cycle de Vie d'un Test

```
┌─────────────────────────────────────────────────────────┐
│                  CYCLE DE VIE                           │
│                                                         │
│  beforeAll()                                            │
│      │                                                  │
│      ├──► beforeEach()                                  │
│      │        │                                         │
│      │        ├──► it('test 1')                         │
│      │        │                                         │
│      │        └──► afterEach()                          │
│      │                                                  │
│      ├──► beforeEach()                                  │
│      │        │                                         │
│      │        ├──► it('test 2')                         │
│      │        │                                         │
│      │        └──► afterEach()                          │
│      │                                                  │
│      └──► afterAll()                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘

beforeAll    : Une fois avant tous les tests
beforeEach   : Avant chaque test
it           : Un test
afterEach    : Après chaque test
afterAll     : Une fois après tous les tests
```

---

## 🎭 Mocking Expliqué

```
┌─────────────────────────────────────────────────────────┐
│              SANS MOCK (Test E2E)                       │
│                                                         │
│  Test ──► Service ──► Prisma ──► Database              │
│                                     │                   │
│                                     ▼                   │
│                              [Vraies données]           │
│                                                         │
│  ✅ Réaliste                                            │
│  ❌ Lent                                                │
│  ❌ Dépend de la DB                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              AVEC MOCK (Test Unitaire)                  │
│                                                         │
│  Test ──► Service ──► Mock Prisma                      │
│                           │                             │
│                           ▼                             │
│                    [Fausses données]                    │
│                                                         │
│  ✅ Rapide                                              │
│  ✅ Indépendant                                         │
│  ✅ Contrôlé                                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 AAA Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    AAA PATTERN                          │
│                                                         │
│  it('should create a product', async () => {           │
│                                                         │
│    // 1. ARRANGE (Préparer)                            │
│    ┌─────────────────────────────────────┐             │
│    │ const dto = { name: 'Test' };       │             │
│    │ const expected = { id: 1, ...dto }; │             │
│    │ mock.create.mockResolvedValue(...); │             │
│    └─────────────────────────────────────┘             │
│                                                         │
│    // 2. ACT (Exécuter)                                │
│    ┌─────────────────────────────────────┐             │
│    │ const result = await service.create(dto); │       │
│    └─────────────────────────────────────┘             │
│                                                         │
│    // 3. ASSERT (Vérifier)                             │
│    ┌─────────────────────────────────────┐             │
│    │ expect(result).toEqual(expected);   │             │
│    │ expect(mock.create).toHaveBeenCalled(); │         │
│    └─────────────────────────────────────┘             │
│  });                                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Test Unitaire vs E2E

```
┌─────────────────────────────────────────────────────────┐
│                  TEST UNITAIRE                          │
│                                                         │
│  Fichier: products.service.spec.ts                     │
│                                                         │
│  ┌─────────────────────────────────────┐               │
│  │  Test                               │               │
│  │    │                                │               │
│  │    ▼                                │               │
│  │  ProductsService                    │               │
│  │    │                                │               │
│  │    ▼                                │               │
│  │  Mock Prisma (fausses données)     │               │
│  └─────────────────────────────────────┘               │
│                                                         │
│  ✅ Rapide (millisecondes)                             │
│  ✅ Isolé                                               │
│  ✅ Teste la logique métier                            │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    TEST E2E                             │
│                                                         │
│  Fichier: products.e2e-spec.ts                         │
│                                                         │
│  ┌─────────────────────────────────────┐               │
│  │  Test HTTP Request                  │               │
│  │    │                                │               │
│  │    ▼                                │               │
│  │  ProductsController                 │               │
│  │    │                                │               │
│  │    ▼                                │               │
│  │  ProductsService                    │               │
│  │    │                                │               │
│  │    ▼                                │               │
│  │  Prisma (vraie DB)                  │               │
│  └─────────────────────────────────────┘               │
│                                                         │
│  ✅ Réaliste                                            │
│  ✅ Teste tout le flux                                 │
│  ❌ Lent (secondes)                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Flux d'un Test E2E

```
┌─────────────────────────────────────────────────────────┐
│              FLUX D'UN TEST E2E                         │
│                                                         │
│  1. Démarrer l'application                             │
│     ┌─────────────────────────────────┐                │
│     │ app = await NestFactory.create()│                │
│     └─────────────────────────────────┘                │
│                  │                                      │
│                  ▼                                      │
│  2. Envoyer une requête HTTP                           │
│     ┌─────────────────────────────────┐                │
│     │ request(app.getHttpServer())    │                │
│     │   .post('/products')            │                │
│     │   .send({ name: 'Test' })       │                │
│     └─────────────────────────────────┘                │
│                  │                                      │
│                  ▼                                      │
│  3. Controller reçoit la requête                       │
│     ┌─────────────────────────────────┐                │
│     │ @Post()                         │                │
│     │ create(@Body() dto) { ... }     │                │
│     └─────────────────────────────────┘                │
│                  │                                      │
│                  ▼                                      │
│  4. Service traite la logique                          │
│     ┌─────────────────────────────────┐                │
│     │ service.create(dto)             │                │
│     └─────────────────────────────────┘                │
│                  │                                      │
│                  ▼                                      │
│  5. Prisma sauvegarde en DB                            │
│     ┌─────────────────────────────────┐                │
│     │ prisma.product.create(...)      │                │
│     └─────────────────────────────────┘                │
│                  │                                      │
│                  ▼                                      │
│  6. Réponse retournée                                  │
│     ┌─────────────────────────────────┐                │
│     │ { id: 1, name: 'Test' }         │                │
│     └─────────────────────────────────┘                │
│                  │                                      │
│                  ▼                                      │
│  7. Test vérifie la réponse                            │
│     ┌─────────────────────────────────┐                │
│     │ expect(201)                     │                │
│     │ expect(res.body.name).toBe(...) │                │
│     └─────────────────────────────────┘                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Matchers Visuels

```
┌─────────────────────────────────────────────────────────┐
│                    MATCHERS                             │
│                                                         │
│  toBe()                                                 │
│  ┌─────┐     ┌─────┐                                   │
│  │  5  │ === │  5  │  ✅                                │
│  └─────┘     └─────┘                                   │
│                                                         │
│  toEqual()                                              │
│  ┌─────────┐     ┌─────────┐                           │
│  │ {a: 1}  │ === │ {a: 1}  │  ✅                        │
│  └─────────┘     └─────────┘                           │
│                                                         │
│  toContain()                                            │
│  ┌─────────────────┐                                   │
│  │ [1, 2, 3, 4, 5] │  contient 3 ?  ✅                 │
│  └─────────────────┘                                   │
│                                                         │
│  toHaveProperty()                                       │
│  ┌─────────────────┐                                   │
│  │ { name: 'Test', │  a la propriété 'name' ?  ✅      │
│  │   price: 100 }  │                                   │
│  └─────────────────┘                                   │
│                                                         │
│  toBeGreaterThan()                                      │
│  ┌─────┐     ┌─────┐                                   │
│  │ 10  │  >  │  5  │  ✅                                │
│  └─────┘     └─────┘                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Couverture de Code

```
┌─────────────────────────────────────────────────────────┐
│              COUVERTURE DE CODE                         │
│                                                         │
│  Fichier: products.service.ts                          │
│                                                         │
│  1  class ProductsService {                            │
│  2    create(dto) {              ✅ Testé              │
│  3      return prisma.create()   ✅ Testé              │
│  4    }                                                 │
│  5                                                      │
│  6    findAll() {                ✅ Testé              │
│  7      return prisma.findMany() ✅ Testé              │
│  8    }                                                 │
│  9                                                      │
│  10   findOne(id) {              ❌ Non testé          │
│  11     if (!id) throw Error()   ❌ Non testé          │
│  12     return prisma.findUnique()                     │
│  13   }                                                 │
│  14 }                                                   │
│                                                         │
│  Couverture: 66.67% (8/12 lignes)                      │
│                                                         │
│  ┌─────────────────────────────────────┐               │
│  │ ████████████░░░░░░░░░░░░░░░░░░░░░░ │ 66.67%        │
│  └─────────────────────────────────────┘               │
│                                                         │
│  Objectif: > 80%                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎭 Mock vs Spy vs Stub

```
┌─────────────────────────────────────────────────────────┐
│                      MOCK                               │
│                                                         │
│  Remplace complètement une fonction                    │
│                                                         │
│  const mock = jest.fn()                                │
│  mock.mockReturnValue(42)                              │
│                                                         │
│  ┌──────────┐                                          │
│  │ Fonction │ ──X──► [Remplacée par mock]              │
│  │ Réelle   │                                          │
│  └──────────┘                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      SPY                                │
│                                                         │
│  Observe une fonction sans la remplacer                │
│                                                         │
│  const spy = jest.spyOn(obj, 'method')                 │
│                                                         │
│  ┌──────────┐                                          │
│  │ Fonction │ ──►  [Exécutée + Observée]               │
│  │ Réelle   │                                          │
│  └──────────┘                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      STUB                               │
│                                                         │
│  Remplace avec une implémentation simple               │
│                                                         │
│  const stub = jest.fn().mockImplementation(() => 42)   │
│                                                         │
│  ┌──────────┐                                          │
│  │ Fonction │ ──X──► [Implémentation simple]           │
│  │ Réelle   │                                          │
│  └──────────┘                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚦 TDD (Test-Driven Development)

```
┌─────────────────────────────────────────────────────────┐
│              CYCLE TDD (RED-GREEN-REFACTOR)             │
│                                                         │
│                    ┌──────────┐                         │
│                    │   RED    │                         │
│                    │ Écrire   │                         │
│                    │ un test  │                         │
│                    │ qui fail │                         │
│                    └────┬─────┘                         │
│                         │                               │
│                         ▼                               │
│                    ┌──────────┐                         │
│                    │  GREEN   │                         │
│                    │ Écrire   │                         │
│                    │ le code  │                         │
│                    │ minimal  │                         │
│                    └────┬─────┘                         │
│                         │                               │
│                         ▼                               │
│                    ┌──────────┐                         │
│                    │ REFACTOR │                         │
│                    │ Améliorer│                         │
│                    │ le code  │                         │
│                    └────┬─────┘                         │
│                         │                               │
│                         └──────────┐                    │
│                                    │                    │
│                                    ▼                    │
│                              [Recommencer]              │
│                                                         │
└─────────────────────────────────────────────────────────┘

Exemple:
1. RED    : it('should add numbers') { expect(add(2,3)).toBe(5) } ❌
2. GREEN  : function add(a, b) { return a + b } ✅
3. REFACTOR: Améliorer si nécessaire
```

---

## 📊 Rapport de Couverture

```
┌─────────────────────────────────────────────────────────┐
│              RAPPORT DE COUVERTURE                      │
│                                                         │
│  File              │ % Stmts │ % Branch │ % Funcs │ % Lines │
│  ──────────────────┼─────────┼──────────┼─────────┼─────────│
│  All files         │   85.71 │    66.67 │     100 │   85.71 │
│  ──────────────────┼─────────┼──────────┼─────────┼─────────│
│  products.service  │   90.00 │    75.00 │     100 │   90.00 │
│  orders.service    │   85.00 │    60.00 │     100 │   85.00 │
│  categorie.service │   80.00 │    50.00 │     100 │   80.00 │
│                                                         │
│  Légende:                                               │
│  % Stmts   : Pourcentage d'instructions testées        │
│  % Branch  : Pourcentage de branches (if/else) testées │
│  % Funcs   : Pourcentage de fonctions testées          │
│  % Lines   : Pourcentage de lignes testées             │
│                                                         │
│  ┌─────────────────────────────────────┐               │
│  │ ████████████████████████████░░░░░░░ │ 85.71%        │
│  └─────────────────────────────────────┘               │
│                                                         │
│  ✅ Objectif atteint (> 80%)                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Stratégie de Tests

```
┌─────────────────────────────────────────────────────────┐
│              STRATÉGIE DE TESTS                         │
│                                                         │
│  1. Commencer par les tests unitaires                  │
│     ┌─────────────────────────────────┐                │
│     │ ✅ Service.create()             │                │
│     │ ✅ Service.findAll()            │                │
│     │ ✅ Service.findOne()            │                │
│     │ ✅ Service.update()             │                │
│     │ ✅ Service.remove()             │                │
│     └─────────────────────────────────┘                │
│                                                         │
│  2. Ajouter les tests E2E                              │
│     ┌─────────────────────────────────┐                │
│     │ ✅ POST /products               │                │
│     │ ✅ GET /products                │                │
│     │ ✅ GET /products/:id            │                │
│     │ ✅ PATCH /products/:id          │                │
│     │ ✅ DELETE /products/:id         │                │
│     └─────────────────────────────────┘                │
│                                                         │
│  3. Tester les cas d'erreur                            │
│     ┌─────────────────────────────────┐                │
│     │ ✅ Produit non trouvé           │                │
│     │ ✅ Données invalides            │                │
│     │ ✅ Erreur de base de données    │                │
│     └─────────────────────────────────┘                │
│                                                         │
│  4. Viser 80%+ de couverture                           │
│     ┌─────────────────────────────────┐                │
│     │ ████████████████████████████░░░ │ 85%            │
│     └─────────────────────────────────┘                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Bon apprentissage ! 🚀**
