# 🧪 Tests - YouShop API

## 📁 Fichiers Créés

Voici tous les fichiers de tests que j'ai créés pour toi :

### 1. Tests Unitaires
- ✅ `src/products/products.service.spec.ts` - Tests complets du service Products
- ✅ `src/orders/orders.service.spec.ts` - Tests complets du service Orders avec Redis

### 2. Tests E2E
- ✅ `test/products.e2e-spec.ts` - Tests end-to-end pour l'API Products
- ✅ `test/auth.e2e-spec.ts` - Tests end-to-end pour l'authentification (déjà existant)

### 3. Documentation
- ✅ `GUIDE_TESTS.md` - Guide complet en français avec exemples
- ✅ `EXERCICES_TESTS.md` - Exercices pratiques pour apprendre
- ✅ `README_TESTS.md` - Ce fichier récapitulatif

---

## 🎯 Qu'est-ce qu'un Test ?

Un test vérifie automatiquement que ton code fonctionne correctement.

**Exemple simple :**
```typescript
it('devrait additionner 2 + 3', () => {
  const resultat = 2 + 3;
  expect(resultat).toBe(5); // ✅ Passe
});
```

---

## 🔍 Types de Tests

### 1. Tests Unitaires (.spec.ts)
- Testent **une fonction** isolée
- Utilisent des **fausses données** (mocks)
- **Rapides** (millisecondes)
- Exemple : Tester la fonction `create()` d'un service

### 2. Tests E2E (.e2e-spec.ts)
- Testent **toute l'application**
- Utilisent la **vraie base de données**
- **Plus lents** (secondes)
- Exemple : Tester l'endpoint `POST /products`

---

## 🚀 Commandes Essentielles

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch (auto-reload)
npm run test:watch

# Lancer les tests avec couverture de code
npm run test:cov

# Lancer les tests E2E
npm run test:e2e

# Lancer un fichier spécifique
npm test -- products.service.spec.ts
```

---

## 📚 Structure d'un Test

```typescript
describe('Nom du module', () => {
  // beforeEach : avant chaque test
  beforeEach(() => {
    // Préparer les données
  });

  it('description du test', () => {
    // 1. Arrange : Préparer
    const data = { name: 'Test' };
    
    // 2. Act : Exécuter
    const result = service.create(data);
    
    // 3. Assert : Vérifier
    expect(result).toBeDefined();
  });
});
```

---

## 🎓 Apprendre Étape par Étape

### Niveau 1 : Débutant
1. Lis le fichier `GUIDE_TESTS.md`
2. Regarde les exemples dans `products.service.spec.ts`
3. Lance `npm test` pour voir les tests passer

### Niveau 2 : Intermédiaire
1. Fais les exercices dans `EXERCICES_TESTS.md`
2. Crée tes propres tests pour `CategorieService`
3. Lance `npm run test:watch` pour voir les résultats en temps réel

### Niveau 3 : Avancé
1. Crée des tests E2E pour les catégories
2. Teste les cas d'erreur (produit non trouvé, etc.)
3. Vise 80%+ de couverture de code

---

## 💡 Exemples Rapides

### Test Simple
```typescript
it('devrait retourner "Hello"', () => {
  const result = 'Hello';
  expect(result).toBe('Hello');
});
```

### Test avec Mock
```typescript
it('devrait créer un produit', async () => {
  const mockData = { id: 1, name: 'Test' };
  mockPrisma.product.create.mockResolvedValue(mockData);
  
  const result = await service.create({ name: 'Test' });
  
  expect(result).toEqual(mockData);
});
```

### Test E2E
```typescript
it('POST /products', () => {
  return request(app.getHttpServer())
    .post('/products')
    .send({ name: 'Test', price: 100 })
    .expect(201);
});
```

---

## 🔧 Les Matchers (Vérifications)

```typescript
// Égalité
expect(value).toBe(5);                    // Égalité stricte
expect(value).toEqual({ name: 'test' }); // Égalité d'objets

// Vérité
expect(value).toBeTruthy();              // Vrai
expect(value).toBeFalsy();               // Faux
expect(value).toBeDefined();             // Défini
expect(value).toBeNull();                // Null

// Nombres
expect(value).toBeGreaterThan(10);       // > 10
expect(value).toBeLessThan(20);          // < 20

// Tableaux
expect(array).toContain('item');         // Contient
expect(array).toHaveLength(3);           // Longueur = 3

// Objets
expect(obj).toHaveProperty('name');      // A la propriété

// Erreurs
expect(() => fn()).toThrow();            // Lance une erreur
```

---

## 📊 Couverture de Code

La couverture montre quel % de ton code est testé :

```bash
npm run test:cov
```

**Résultat :**
```
File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
products.svc   |   85.71 |    66.67 |     100 |   85.71
orders.svc     |   92.30 |    75.00 |     100 |   92.30
```

**Objectif :** > 80% de couverture

---

## 🎯 Bonnes Pratiques

1. ✅ **Un test = Une chose** : Chaque test vérifie UNE seule chose
2. ✅ **Noms descriptifs** : `it('devrait créer un produit avec succès')`
3. ✅ **AAA Pattern** : Arrange, Act, Assert
4. ✅ **Nettoyer après** : Utiliser `afterEach` pour nettoyer
5. ✅ **Isoler les tests** : Chaque test doit être indépendant
6. ✅ **Mock les dépendances** : Ne pas utiliser la vraie DB dans les tests unitaires

---

## 🐛 Déboguer les Tests

```typescript
// Afficher dans la console
it('debug test', () => {
  console.log('Value:', value);
  expect(value).toBeDefined();
});

// Lancer un seul test
it.only('ce test uniquement', () => {
  expect(true).toBe(true);
});

// Ignorer un test
it.skip('test ignoré', () => {
  expect(true).toBe(true);
});
```

---

## 📖 Ressources

### Fichiers à Lire
1. `GUIDE_TESTS.md` - Guide complet avec exemples
2. `EXERCICES_TESTS.md` - Exercices pratiques
3. `src/products/products.service.spec.ts` - Exemple de test unitaire
4. `test/products.e2e-spec.ts` - Exemple de test E2E

### Documentation Officielle
- [Jest](https://jestjs.io/docs/getting-started) - Framework de tests
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing) - Tests dans NestJS
- [Supertest](https://github.com/visionmedia/supertest) - Tests HTTP

---

## 🎮 Exercices Pratiques

### Exercice 1 : Créer un test simple
```bash
# Ouvre le fichier
code src/categorie/categorie.service.spec.ts

# Lance les tests
npm run test:watch
```

### Exercice 2 : Créer un test E2E
```bash
# Ouvre le fichier
code test/categorie.e2e-spec.ts

# Lance les tests E2E
npm run test:e2e
```

---

## ❓ FAQ

### Q: Quelle est la différence entre .toBe() et .toEqual() ?
**R:** 
- `.toBe()` : Égalité stricte (===), pour les primitives (nombres, strings)
- `.toEqual()` : Égalité profonde, pour les objets et tableaux

### Q: Pourquoi mes tests sont lents ?
**R:** 
- Les tests E2E sont plus lents (utilisent la vraie DB)
- Les tests unitaires doivent être rapides (utilisent des mocks)

### Q: Comment tester une fonction async ?
**R:**
```typescript
it('test async', async () => {
  const result = await service.findAll();
  expect(result).toBeDefined();
});
```

### Q: Comment mocker Prisma ?
**R:**
```typescript
jest.mock('lib/prisma', () => ({
  __esModule: true,
  default: {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));
```

---

## 🎉 Prochaines Étapes

1. ✅ Lis le `GUIDE_TESTS.md`
2. ✅ Lance `npm test` pour voir les tests existants
3. ✅ Fais les exercices dans `EXERCICES_TESTS.md`
4. ✅ Crée tes propres tests pour `CategorieService`
5. ✅ Vise 80%+ de couverture avec `npm run test:cov`

---

## 💪 Motivation

> "Les tests ne sont pas une perte de temps, ils te font gagner du temps !"

- ✅ Détecte les bugs avant la production
- ✅ Documente ton code
- ✅ Facilite les modifications
- ✅ Donne confiance en ton code

**Bon courage et bon apprentissage ! 🚀**
