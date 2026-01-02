import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Créer des catégories
  const categories = await Promise.all([
    prisma.categorie.create({
      data: { name: 'Électronique' }
    }),
    prisma.categorie.create({
      data: { name: 'Vêtements' }
    }),
    prisma.categorie.create({
      data: { name: 'Maison & Jardin' }
    }),
    prisma.categorie.create({
      data: { name: 'Sports & Loisirs' }
    })
  ]);

  // Créer des utilisateurs
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@youshop.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'YouShop',
        dateNaissance: new Date('1990-01-01')
      }
    }),
    prisma.user.create({
      data: {
        email: 'client1@example.com',
        password: hashedPassword,
        firstName: 'Marie',
        lastName: 'Dupont',
        dateNaissance: new Date('1985-05-15')
      }
    }),
    prisma.user.create({
      data: {
        email: 'client2@example.com',
        password: hashedPassword,
        firstName: 'Pierre',
        lastName: 'Martin',
        dateNaissance: new Date('1992-08-20')
      }
    })
  ]);

  // Créer des produits
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 15',
        description: 'Dernier smartphone Apple',
        price: 999.99,
        categoryId: categories[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Pro',
        description: 'Ordinateur portable professionnel',
        price: 2499.99,
        categoryId: categories[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'T-shirt Nike',
        description: 'T-shirt de sport confortable',
        price: 29.99,
        categoryId: categories[1].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Jean Levi\'s',
        description: 'Jean classique bleu',
        price: 79.99,
        categoryId: categories[1].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Aspirateur Dyson',
        description: 'Aspirateur sans fil puissant',
        price: 399.99,
        categoryId: categories[2].id
      }
    })
  ]);

  // Créer l'inventaire
  await Promise.all([
    prisma.inventory.create({
      data: {
        productId: products[0].id,
        quantity: 50
      }
    }),
    prisma.inventory.create({
      data: {
        productId: products[1].id,
        quantity: 25
      }
    }),
    prisma.inventory.create({
      data: {
        productId: products[2].id,
        quantity: 100
      }
    }),
    prisma.inventory.create({
      data: {
        productId: products[3].id,
        quantity: 75
      }
    }),
    prisma.inventory.create({
      data: {
        productId: products[4].id,
        quantity: 30
      }
    })
  ]);

  // Créer des commandes
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        clientId: users[1].id
      }
    }),
    prisma.order.create({
      data: {
        clientId: users[2].id
      }
    })
  ]);

  // Créer des articles de commande
  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[0].id,
        quantity: 1
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[2].id,
        quantity: 2
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[1].id,
        quantity: 1
      }
    })
  ]);

  console.log('✅ Base de données peuplée avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du peuplement :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });