# 📚 Documentation des Tests - YouShop API

Bienvenue dans la documentation complète des tests ! 🎉

## 🗺️ Navigation

### 🎓 Pour Débutants

1. **[README_TESTS.md](./README_TESTS.md)** ⭐ COMMENCE ICI
   - Vue d'ensemble des tests
   - Concepts de base
   - Commandes essentielles
   - FAQ

2. **[GUIDE_TESTS.md](./GUIDE_TESTS.md)**
   - Guide complet avec exemples
   - Structure d'un test
   - Mocking expliqué
   - Bonnes pratiques

3. **[EXERCICES_TESTS.md](./EXERCICES_TESTS.md)**
   - Exercices pratiques
   - Niveau débutant à avancé
   - Solutions incluses

### 🚀 Pour Intermédiaires

4. **[CHEAT_SHEET_TESTS.md](./CHEAT_SHEET_TESTS.md)**
   - Référence rapide
   - Toutes les commandes
   - Tous les matchers
   - Exemples courts

5. **Exemples de Tests**
   - `src/products/products.service.spec.ts` - Test unitaire complet
   - `src/orders/orders.service.spec.ts` - Test avec Redis
   - `test/products.e2e-spec.ts` - Test E2E complet
   - `test/auth.e2e-spec.ts` - Test d'authentification

### 🎯 Pour Avancés

6. **[PATTERNS_TESTS.md](./PATTERNS_TESTS.md)**
   - Patterns avancés (Factory, Builder)
   - Tests d'intégration
   - Tests de performance
   - Custom matchers

---

## 🎯 Parcours d'Apprentissage

### Jour 1 : Les Bases
1. Lis [README_TESTS.md](./README_TESTS.md) (15 min)
2. Lance `npm test` pour voir les tests existants (5 min)
3. Lis [GUIDE_TESTS.md](./GUIDE_TESTS.md) - Section "Les Bases" (20 min)
4. Fais l'Exercice 1 dans [EXERCICES_TESTS.md](./EXERCICES_TESTS.md) (30 min)

**Total : ~1h10**

### Jour 2 : Tests Unitaires
1. Lis [GUIDE_TESTS.md](./GUIDE_TESTS.md) - Section "Mocking" (20 min)
2. Étudie `src/products/products.service.spec.ts` (15 min)
3. Fais l'Exercice 2 dans [EXERCICES_TESTS.md](./EXERCICES_TESTS.md) (45 min)
4. Lance `npm run test:cov` pour voir ta couverture (5 min)

**Total : ~1h25**

### Jour 3 : Tests E2E
1. Lis [GUIDE_TESTS.md](./GUIDE_TESTS.md) - Section "Tests E2E" (15 min)
2. Étudie `test/products.e2e-spec.ts` (15 min)
3. Fais l'Exercice 3 dans [EXERCICES_TESTS.md](./EXERCICES_TESTS.md) (60 min)
4. Lance `npm run test:e2e` (5 min)

**Total : ~1h35**

### Jour 4 : Patterns Avancés
1. Lis [PATTERNS_TESTS.md](./PATTERNS_TESTS.md) (30 min)
2. Implémente un Factory Pattern (30 min)
3. Crée des Test Helpers (30 min)

**Total : ~1h30**

### Jour 5 : Pratique
1. Crée des tests pour `CategorieService` (60 min)
2. Crée des tests E2E pour `/categorie` (60 min)
3. Vise 80%+ de couverture (30 min)

**Total : ~2h30**

---

## 📊 Structure des Fichiers

```
youshop-api/
├── src/
│   ├── products/
│   │   ├── products.service.ts
│   │   └── products.service.spec.ts ✅ Test unitaire
│   ├── orders/
│   │   ├── orders.service.ts
│   │   └── orders.service.spec.ts ✅ Test unitaire
│   └── categorie/
│       ├── categorie.service.ts
│       └── categorie.service.spec.ts ⚠️ À créer
│
├── test/
│   ├── auth.e2e-spec.ts ✅ Test E2E
│   ├── products.e2e-spec.ts ✅ Test E2E
│   └── categorie.e2e-spec.ts ⚠️ À créer
│
└── Documentation/
    ├── INDEX_TESTS.md ⭐ Ce fichier
    ├── README_TESTS.md
    ├── GUIDE_TESTS.md
    ├── EXERCICES_TESTS.md
    ├── CHEAT_SHEET_TESTS.md
    └── PATTERNS_TESTS.md
```

---

## 🎯 Objectifs

### Court Terme (Cette Semaine)
- [ ] Comprendre les bases des tests
- [ ] Créer ton premier test unitaire
- [ ] Créer ton premier test E2E
- [ ] Atteindre 50%+ de couverture

### Moyen Terme (Ce Mois)
- [ ] Maîtriser les mocks
- [ ] Tester tous les services
- [ ] Tester tous les endpoints
- [ ] Atteindre 80%+ de couverture

### Long Terme (Ce Trimestre)
- [ ] Utiliser des patterns avancés
- [ ] Tests de performance
- [ ] Tests d'intégration
- [ ] CI/CD avec tests automatiques

---

## 🚀 Commandes Rapides

```bash
# Démarrage rapide
npm test                    # Lancer tous les tests
npm run test:watch         # Mode watch
npm run test:cov           # Avec couverture

# Tests spécifiques
npm test -- products       # Tests contenant "products"
npm run test:e2e          # Tests E2E uniquement

# Déboguer
npm run test:debug        # Mode debug
npm test -- --verbose     # Mode verbose
```

---

## 📖 Glossaire

- **Test Unitaire** : Teste une fonction isolée
- **Test E2E** : Teste l'application complète
- **Mock** : Fausse donnée pour simuler un service
- **Spy** : Espionner les appels d'une fonction
- **Stub** : Remplacer une fonction par une fausse
- **Fixture** : Données de test prédéfinies
- **Coverage** : Pourcentage de code testé
- **Assertion** : Vérification d'une condition (expect)
- **Matcher** : Fonction de comparaison (toBe, toEqual)

---

## 🎓 Ressources Externes

### Documentation Officielle
- [Jest](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest](https://github.com/visionmedia/supertest)

### Tutoriels
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Jest Crash Course](https://www.youtube.com/watch?v=7r4xVDI2vho)
- [NestJS Testing Tutorial](https://www.youtube.com/watch?v=1Vc6Xw8FMpg)

### Articles
- [Unit Testing Best Practices](https://testdriven.io/blog/unit-testing-best-practices/)
- [E2E Testing Guide](https://martinfowler.com/articles/practical-test-pyramid.html)

---

## 💡 Conseils

### Pour Bien Apprendre
1. **Pratique régulière** : 30 min par jour > 3h une fois
2. **Commence simple** : Tests basiques avant les avancés
3. **Lis le code** : Étudie les tests existants
4. **Expérimente** : Casse des choses pour comprendre
5. **Demande de l'aide** : N'hésite pas à poser des questions

### Pour Écrire de Bons Tests
1. **Un test = Une chose** : Teste une seule fonctionnalité
2. **Noms clairs** : "devrait créer un produit avec succès"
3. **AAA Pattern** : Arrange, Act, Assert
4. **Tests indépendants** : Chaque test doit fonctionner seul
5. **Mock les dépendances** : Isole ce que tu testes

---

## 🐛 Problèmes Courants

### "Cannot find module"
```bash
npm install
```

### "Tests timeout"
```typescript
it('test', async () => {
  // ...
}, 10000); // Augmenter le timeout
```

### "Database connection error"
```bash
# Vérifier que la DB est lancée
docker-compose up -d
```

### "Mock not working"
```typescript
// Vérifier que le mock est avant l'import
jest.mock('lib/prisma');
import prisma from 'lib/prisma';
```

---

## 📞 Support

### Questions ?
1. Relis la documentation
2. Regarde les exemples
3. Cherche sur Google/Stack Overflow
4. Demande à ton équipe

### Bugs ?
1. Vérifie les logs d'erreur
2. Lance en mode verbose : `npm test -- --verbose`
3. Utilise le debugger
4. Crée une issue sur GitHub

---

## 🎉 Félicitations !

Tu as maintenant accès à une documentation complète sur les tests ! 🚀

**Prochaine étape :** Commence par [README_TESTS.md](./README_TESTS.md)

Bon courage et bon apprentissage ! 💪

---

## 📝 Changelog

- **v1.0** (Aujourd'hui) : Création de la documentation complète
  - README_TESTS.md
  - GUIDE_TESTS.md
  - EXERCICES_TESTS.md
  - CHEAT_SHEET_TESTS.md
  - PATTERNS_TESTS.md
  - INDEX_TESTS.md
  - Tests pour Products et Orders

---

**Made with ❤️ for YouShop API**
