# YouShop API

## GitFlow Strategy

### Branches

- **main** : Production (protected)
- **develop** : Development (protected)
- **feature/** : New features
- **hotfix/** : Production fixes
- **release/** : Release preparation

### Workflow

```bash
# Feature development
git checkout develop
git checkout -b feature/nom-feature
# ... work ...
git push origin feature/nom-feature
# Create PR to develop

# Release
git checkout develop
git checkout -b release/v1.0.0
# ... final tests ...
git checkout main
git merge release/v1.0.0
git tag v1.0.0
git checkout develop
git merge release/v1.0.0

# Hotfix
git checkout main
git checkout -b hotfix/fix-critical
# ... fix ...
git checkout main
git merge hotfix/fix-critical
git tag v1.0.1
git checkout develop
git merge hotfix/fix-critical
```

## CI/CD Pipeline

- **Push to develop** : Run tests + build
- **Push to main** : Run tests + build + deploy
- **Pull Request** : Run tests

## Setup

```bash
npm install
cp .env.example .env
docker-compose up -d
npx prisma migrate dev
npm run db:seed
npm run dev
```

## Tests

```bash
npm test
npm run test:e2e
npm run test:cov
```
