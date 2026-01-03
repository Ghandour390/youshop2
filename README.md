# YouShop - E-commerce Platform

## Structure

```
YouShop/
├── youshop-api/          # Backend NestJS
└── .github/workflows/    # CI/CD
```

## GitFlow

### Branches
- **main** : Production
- **develop** : Development
- **feature/** : New features
- **hotfix/** : Production fixes
- **release/** : Release preparation

### Workflow

```bash
# Feature
git checkout develop
git checkout -b feature/nom-feature
git push origin feature/nom-feature
# Create PR to develop

# Release
git checkout develop
git checkout -b release/v1.0.0
git checkout main
git merge release/v1.0.0
git tag v1.0.0
git checkout develop
git merge release/v1.0.0

# Hotfix
git checkout main
git checkout -b hotfix/fix-critical
git checkout main
git merge hotfix/fix-critical
git tag v1.0.1
git checkout develop
git merge hotfix/fix-critical
```

## Quick Start

```bash
cd youshop-api
npm install
docker-compose up -d
npx prisma migrate dev
npm run db:seed
npm run dev
```

## CI/CD

- Push to **develop** → Tests + Build
- Push to **main** → Tests + Build + Deploy
- Pull Request → Tests
