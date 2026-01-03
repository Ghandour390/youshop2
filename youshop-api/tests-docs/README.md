# 📚 Documentation des Tests - YouShop API

Bienvenue dans la documentation complète pour apprendre à écrire des tests ! 🎉

## 🚀 Démarrage Rapide

**Nouveau dans les tests ?** Commence ici :

1. 📖 Lis [README_TESTS.md](./README_TESTS.md) (15 min)
2. 🎓 Suis le [GUIDE_TESTS.md](./GUIDE_TESTS.md) (30 min)
3. 💪 Fais les [EXERCICES_TESTS.md](./EXERCICES_TESTS.md) (1h)

---

## 📁 Fichiers Disponibles

### 🎯 Pour Débutants

| Fichier | Description | Temps |
|---------|-------------|-------|
| **[README_TESTS.md](./README_TESTS.md)** | Vue d'ensemble, concepts de base, FAQ | 15 min |
| **[GUIDE_TESTS.md](./GUIDE_TESTS.md)** | Guide complet avec exemples détaillés | 30 min |
| **[EXERCICES_TESTS.md](./EXERCICES_TESTS.md)** | Exercices pratiques avec solutions | 1-2h |

### 🚀 Pour Intermédiaires

| Fichier | Description | Temps |
|---------|-------------|-------|
| **[CHEAT_SHEET_TESTS.md](./CHEAT_SHEET_TESTS.md)** | Référence rapide de toutes les commandes | 10 min |
| **[CONCEPTS_VISUELS_TESTS.md](./CONCEPTS_VISUELS_TESTS.md)** | Diagrammes et explications visuelles | 20 min |

### 🎯 Pour Avancés

| Fichier | Description | Temps |
|---------|-------------|-------|
| **[PATTERNS_TESTS.md](./PATTERNS_TESTS.md)** | Patterns avancés (Factory, Builder, etc.) | 45 min |
| **[INDEX_TESTS.md](./INDEX_TESTS.md)** | Index complet avec parcours d'apprentissage | 10 min |

---

## 🎓 Parcours d'Apprentissage Recommandé

### Semaine 1 : Les Bases
```
Jour 1 : README_TESTS.md + Lancer npm test
Jour 2 : GUIDE_TESTS.md (Section "Les Bases")
Jour 3 : EXERCICES_TESTS.md (Exercice 1)
Jour 4 : Créer ton premier test unitaire
Jour 5 : Révision et pratique
```

### Semaine 2 : Tests Unitaires
```
Jour 1 : GUIDE_TESTS.md (Section "Mocking")
Jour 2 : Étudier products.service.spec.ts
Jour 3 : EXERCICES_TESTS.md (Exercice 2)
Jour 4 : Créer des tests pour CategorieService
Jour 5 : Viser 50%+ de couverture
```

### Semaine 3 : Tests E2E
```
Jour 1 : GUIDE_TESTS.md (Section "Tests E2E")
Jour 2 : Étudier products.e2e-spec.ts
Jour 3 : EXERCICES_TESTS.md (Exercice 3)
Jour 4 : Créer des tests E2E pour /categorie
Jour 5 : Viser 80%+ de couverture
```

### Semaine 4 : Patterns Avancés
```
Jour 1-2 : PATTERNS_TESTS.md
Jour 3-4 : Implémenter Factory et Builder patterns
Jour 5 : Révision générale
```

---

## 🎯 Objectifs par Niveau

### Niveau Débutant ✅
- [ ] Comprendre ce qu'est un test
- [ ] Lancer `npm test` avec succès
- [ ] Créer un test simple qui passe
- [ ] Comprendre AAA Pattern (Arrange, Act, Assert)
- [ ] Utiliser les matchers de base (toBe, toEqual)

### Niveau Intermédiaire ✅
- [ ] Créer des tests unitaires pour un service
- [ ] Utiliser des mocks (Prisma, Redis)
- [ ] Créer des tests E2E pour une API
- [ ] Atteindre 50%+ de couverture
- [ ] Comprendre beforeEach/afterEach

### Niveau Avancé ✅
- [ ] Utiliser des patterns (Factory, Builder)
- [ ] Tester les cas d'erreur
- [ ] Tests d'intégration
- [ ] Atteindre 80%+ de couverture
- [ ] Tests de performance

---

## 🚀 Commandes Essentielles

```bash
# Lancer tous les tests
npm test

# Mode watch (auto-reload)
npm run test:watch

# Avec couverture de code
npm run test:cov

# Tests E2E uniquement
npm run test:e2e

# Fichier spécifique
npm test -- products.service.spec.ts
```

---

## 📊 Fichiers de Tests Créés

### Tests Unitaires
- ✅ `src/products/products.service.spec.ts` - Service Products complet
- ✅ `src/orders/orders.service.spec.ts` - Service Orders avec Redis
- ⚠️ `src/categorie/categorie.service.spec.ts` - À créer (exercice)

### Tests E2E
- ✅ `test/auth.e2e-spec.ts` - Authentification (existant)
- ✅ `test/products.e2e-spec.ts` - API Products complète
- ⚠️ `test/categorie.e2e-spec.ts` - À créer (exercice)

---

## 🎨 Concepts Clés

### Test Unitaire
```typescript
// Teste UNE fonction isolée avec des mocks
it('should create a product', async () => {
  mockPrisma.product.create.mockResolvedValue({ id: 1 });
  const result = await service.create({ name: 'Test' });
  expect(result.id).toBe(1);
});
```

### Test E2E
```typescript
// Teste TOUTE l'application (Controller → Service → DB)
it('POST /products', () => {
  return request(app.getHttpServer())
    .post('/products')
    .send({ name: 'Test', price: 100 })
    .expect(201);
});
```

### Mock
```typescript
// Simule une dépendance externe
const mockPrisma = {
  product: {
    create: jest.fn().mockResolvedValue({ id: 1 }),
  },
};
```

---

## 📈 Progression

```
┌─────────────────────────────────────────┐
│         PYRAMIDE DES TESTS              │
│                                         │
│              ▲                          │
│             ╱ ╲                         │
│            ╱E2E╲        10%             │
│           ╱─────╲                       │
│          ╱Integ.╲       20%             │
│         ╱─────────╲                     │
│        ╱   Unit    ╲    70%             │
│       ╱─────────────╲                   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 💡 Conseils

### Pour Bien Apprendre
1. **Pratique quotidienne** : 30 min/jour > 3h une fois
2. **Commence simple** : Tests basiques avant les avancés
3. **Lis le code** : Étudie les tests existants
4. **Expérimente** : N'aie pas peur de casser des choses
5. **Demande de l'aide** : Utilise la documentation

### Pour Écrire de Bons Tests
1. **Un test = Une chose**
2. **Noms descriptifs** : "devrait créer un produit avec succès"
3. **AAA Pattern** : Arrange, Act, Assert
4. **Tests indépendants** : Chaque test fonctionne seul
5. **Mock les dépendances** : Isole ce que tu testes

---

## 🐛 Problèmes Courants

| Problème | Solution |
|----------|----------|
| "Cannot find module" | `npm install` |
| "Tests timeout" | Augmenter le timeout : `it('test', () => {}, 10000)` |
| "Database error" | Vérifier que Docker est lancé |
| "Mock not working" | Mock avant l'import du module |

---

## 📚 Ressources Externes

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 🎯 Checklist Finale

- [ ] J'ai lu README_TESTS.md
- [ ] J'ai suivi GUIDE_TESTS.md
- [ ] J'ai fait les exercices
- [ ] J'ai créé mes premiers tests
- [ ] J'ai atteint 50%+ de couverture
- [ ] J'ai créé des tests E2E
- [ ] J'ai atteint 80%+ de couverture
- [ ] Je maîtrise les patterns avancés

---

## 🎉 Prochaines Étapes

1. **Commence maintenant** : Ouvre [README_TESTS.md](./README_TESTS.md)
2. **Lance les tests** : `npm test`
3. **Pratique** : Fais les exercices
4. **Partage** : Aide tes collègues

**Bon courage et bon apprentissage ! 🚀**

---

**Made with ❤️ for YouShop API**
