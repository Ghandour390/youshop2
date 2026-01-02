const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Nettoyer les données existantes
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.categorie.deleteMany();

  // Créer des catégories
  const categories = await Promise.all([
    prisma.categorie.create({ data: { name: 'Électronique' } }),
    prisma.categorie.create({ data: { name: 'Vêtements' } }),
    prisma.categorie.create({ data: { name: 'Maison' } }),
  ]);

  // Hasher les mots de passe
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Créer des utilisateurs
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@youshop.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
      },
    }),
    prisma.user.create({
      data: {
        email: 'client@youshop.com',
        password: hashedPassword,
        firstName: 'Client',
        lastName: 'Test',
      },
    }),
  ]);

  // Créer des produits
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 15',
        description: 'Smartphone Apple dernière génération',
        price: 999.99,
        categoryId: categories[0].id,
        inventory: { create: { quantity: 50 } },
      },
    }),
    prisma.product.create({
      data: {
        name: 'T-shirt Nike',
        description: 'T-shirt de sport confortable',
        price: 29.99,
        categoryId: categories[1].id,
        inventory: { create: { quantity: 100 } },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Lampe LED',
        description: 'Lampe de bureau moderne',
        price: 49.99,
        categoryId: categories[2].id,
        inventory: { create: { quantity: 25 } },
      },
    }),
  ]);

  console.log('✅ Seed terminé');
  console.log(`📦 ${categories.length} catégories créées`);
  console.log(`👥 ${users.length} utilisateurs créés`);
  console.log(`🛍️ ${products.length} produits créés`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });