import { PrismaClient, Role, status } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper function to generate random date in the past
function randomPastDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

// Helper function to generate random phone
function randomPhone(): string {
  return `+212${Math.floor(600000000 + Math.random() * 99999999)}`;
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categorie.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // ==================== CATEGORIES ====================
  const categories = await Promise.all([
    prisma.categorie.create({ data: { name: 'Électronique' } }),
    prisma.categorie.create({ data: { name: 'Vêtements Homme' } }),
    prisma.categorie.create({ data: { name: 'Vêtements Femme' } }),
    prisma.categorie.create({ data: { name: 'Maison & Décoration' } }),
    prisma.categorie.create({ data: { name: 'Sports & Fitness' } }),
    prisma.categorie.create({ data: { name: 'Beauté & Santé' } }),
    prisma.categorie.create({ data: { name: 'Livres & Papeterie' } }),
    prisma.categorie.create({ data: { name: 'Jouets & Enfants' } }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // ==================== USERS ====================
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const clientPassword = await bcrypt.hash('Client@123', 10);

  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@youshop.ma',
      password: adminPassword,
      firstName: 'Abdelhak',
      lastName: 'Ghandour',
      role: Role.ADMIN,
      verificationEmail: true,
      phone: '+212661234567',
      address: '123 Avenue Mohammed V, Casablanca',
      dateNaissance: new Date('1990-05-15'),
      createdAt: randomPastDate(365),
    },
  });

  // Client users - Simulating users who registered over time
  const clientsData = [
    { email: 'sara.benali@gmail.com', firstName: 'Sara', lastName: 'Benali', address: '45 Rue Hassan II, Rabat', daysAgo: 340 },
    { email: 'youssef.el.amrani@gmail.com', firstName: 'Youssef', lastName: 'El Amrani', address: '78 Boulevard Zerktouni, Casablanca', daysAgo: 300 },
    { email: 'fatima.zahrae@gmail.com', firstName: 'Fatima Zahra', lastName: 'Ait Ouahmane', address: '12 Avenue Allal Ben Abdellah, Fès', daysAgo: 280 },
    { email: 'omar.tazi@gmail.com', firstName: 'Omar', lastName: 'Tazi', address: '90 Rue Ibn Batouta, Tanger', daysAgo: 250 },
    { email: 'khadija.moussaoui@gmail.com', firstName: 'Khadija', lastName: 'Moussaoui', address: '34 Avenue Mohammed VI, Marrakech', daysAgo: 220 },
    { email: 'ahmed.benjelloun@gmail.com', firstName: 'Ahmed', lastName: 'Benjelloun', address: '56 Rue Moulay Ismail, Meknès', daysAgo: 180 },
    { email: 'laila.chraibi@gmail.com', firstName: 'Laila', lastName: 'Chraibi', address: '23 Boulevard Anfa, Casablanca', daysAgo: 150 },
    { email: 'hamza.alaoui@gmail.com', firstName: 'Hamza', lastName: 'Alaoui', address: '67 Avenue Hassan I, Agadir', daysAgo: 120 },
    { email: 'nadia.berrada@gmail.com', firstName: 'Nadia', lastName: 'Berrada', address: '89 Rue Oued Ziz, Oujda', daysAgo: 90 },
    { email: 'rachid.fassi@gmail.com', firstName: 'Rachid', lastName: 'Fassi Fihri', address: '45 Avenue FAR, Kénitra', daysAgo: 60 },
    { email: 'salma.idrissi@gmail.com', firstName: 'Salma', lastName: 'Idrissi', address: '12 Rue Tarik Ibn Ziad, Tétouan', daysAgo: 30 },
    { email: 'karim.bennani@gmail.com', firstName: 'Karim', lastName: 'Bennani', address: '78 Boulevard Moulay Youssef, El Jadida', daysAgo: 15 },
  ];

  const clients = await Promise.all(
    clientsData.map((client) =>
      prisma.user.create({
        data: {
          email: client.email,
          password: clientPassword,
          firstName: client.firstName,
          lastName: client.lastName,
          role: Role.CLIENT,
          verificationEmail: true,
          phone: randomPhone(),
          address: client.address,
          dateNaissance: new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          createdAt: randomPastDate(client.daysAgo),
        },
      })
    )
  );
  console.log(`✅ Created ${clients.length + 1} users (1 admin + ${clients.length} clients)`);

  // ==================== PRODUCTS ====================
  const productsData = [
    // Électronique (category 0)
    { name: 'iPhone 15 Pro Max 256GB', description: 'Le dernier iPhone avec puce A17 Pro, appareil photo 48MP, et écran Super Retina XDR. Parfait pour la photographie et les performances.', price: 14999.00, categoryIndex: 0, stock: 25 },
    { name: 'Samsung Galaxy S24 Ultra', description: 'Smartphone Android premium avec S Pen intégré, caméra 200MP et écran AMOLED 6.8 pouces.', price: 13499.00, categoryIndex: 0, stock: 30 },
    { name: 'MacBook Pro 14" M3 Pro', description: 'Ordinateur portable Apple avec puce M3 Pro, 18GB RAM, 512GB SSD. Idéal pour les professionnels créatifs.', price: 24999.00, categoryIndex: 0, stock: 15 },
    { name: 'iPad Air 5ème génération', description: 'Tablette Apple avec puce M1, écran Liquid Retina 10.9 pouces, compatible Apple Pencil.', price: 7499.00, categoryIndex: 0, stock: 40 },
    { name: 'AirPods Pro 2ème génération', description: 'Écouteurs sans fil avec réduction de bruit active, audio spatial et boîtier de charge MagSafe.', price: 2999.00, categoryIndex: 0, stock: 100 },
    { name: 'Sony PlayStation 5', description: 'Console de jeu nouvelle génération avec SSD ultra-rapide, manette DualSense et graphismes 4K.', price: 5999.00, categoryIndex: 0, stock: 20 },
    { name: 'Samsung Smart TV 55" QLED 4K', description: 'Téléviseur intelligent avec technologie Quantum Dot, HDR10+ et système Tizen.', price: 8999.00, categoryIndex: 0, stock: 12 },
    { name: 'Apple Watch Series 9', description: 'Montre connectée avec suivi santé avancé, GPS, et écran Always-On Retina.', price: 4999.00, categoryIndex: 0, stock: 50 },

    // Vêtements Homme (category 1)
    { name: 'Costume Slim Fit Marine', description: 'Costume élégant en laine mélangée, coupe slim moderne. Parfait pour les occasions formelles.', price: 1999.00, categoryIndex: 1, stock: 20 },
    { name: 'Chemise Oxford Blanche', description: 'Chemise classique en coton Oxford, col boutonné, coupe regular. Essentiel du vestiaire masculin.', price: 349.00, categoryIndex: 1, stock: 80 },
    { name: 'Jean Levi\'s 501 Original', description: 'Jean iconique coupe droite, denim rigide qui se patine avec le temps.', price: 899.00, categoryIndex: 1, stock: 60 },
    { name: 'Polo Ralph Lauren Classic', description: 'Polo en coton piqué avec logo brodé, col côtelé et coupe ajustée.', price: 1199.00, categoryIndex: 1, stock: 45 },
    { name: 'Sneakers Nike Air Max 90', description: 'Baskets iconiques avec amorti Air visible, design rétro et confort moderne.', price: 1499.00, categoryIndex: 1, stock: 35 },
    { name: 'Veste en Cuir Zara', description: 'Blouson en cuir véritable, style biker avec fermeture asymétrique.', price: 2499.00, categoryIndex: 1, stock: 15 },

    // Vêtements Femme (category 2)
    { name: 'Robe Longue Fleurie', description: 'Robe maxi en viscose légère, motif floral, parfaite pour l\'été.', price: 599.00, categoryIndex: 2, stock: 40 },
    { name: 'Sac à Main Michael Kors', description: 'Sac en cuir Saffiano avec logo signature, bandoulière ajustable.', price: 2999.00, categoryIndex: 2, stock: 25 },
    { name: 'Escarpins Louboutin So Kate', description: 'Escarpins iconiques à semelle rouge, talon 12cm, cuir verni noir.', price: 7999.00, categoryIndex: 2, stock: 10 },
    { name: 'Blazer Oversized Beige', description: 'Blazer tendance coupe oversized, tissu fluide, parfait pour un look décontracté chic.', price: 799.00, categoryIndex: 2, stock: 30 },
    { name: 'Jean Mom Fit Taille Haute', description: 'Jean vintage taille haute, coupe décontractée, denim légèrement délavé.', price: 499.00, categoryIndex: 2, stock: 55 },
    { name: 'Pull Cachemire Col V', description: 'Pull luxueux en pur cachemire, col V élégant, toucher ultra-doux.', price: 1499.00, categoryIndex: 2, stock: 20 },

    // Maison & Décoration (category 3)
    { name: 'Canapé 3 Places Scandinave', description: 'Canapé design nordique en tissu gris, pieds en bois massif, confort optimal.', price: 5999.00, categoryIndex: 3, stock: 8 },
    { name: 'Table Basse en Marbre', description: 'Table basse élégante plateau marbre blanc, structure métal doré.', price: 2499.00, categoryIndex: 3, stock: 12 },
    { name: 'Lampe Suspension Design', description: 'Luminaire suspendu moderne en laiton brossé, abat-jour globe opalin.', price: 899.00, categoryIndex: 3, stock: 30 },
    { name: 'Tapis Berbère 200x300cm', description: 'Tapis artisanal marocain en laine, motifs géométriques traditionnels.', price: 3499.00, categoryIndex: 3, stock: 15 },
    { name: 'Machine à Café Nespresso Vertuo', description: 'Machine à café automatique avec technologie Centrifusion, 5 tailles de tasses.', price: 1999.00, categoryIndex: 3, stock: 40 },
    { name: 'Robot Aspirateur iRobot Roomba', description: 'Aspirateur robot intelligent avec navigation avancée et vidage automatique.', price: 4999.00, categoryIndex: 3, stock: 18 },

    // Sports & Fitness (category 4)
    { name: 'Tapis de Yoga Premium', description: 'Tapis professionnel antidérapant 6mm, matériaux écologiques, sangle incluse.', price: 399.00, categoryIndex: 4, stock: 100 },
    { name: 'Haltères Réglables 24kg', description: 'Set d\'haltères ajustables de 2.5kg à 24kg, gain de place optimal.', price: 2999.00, categoryIndex: 4, stock: 25 },
    { name: 'Vélo Elliptique Pro', description: 'Appareil cardio professionnel avec 20 niveaux de résistance, écran LCD.', price: 6999.00, categoryIndex: 4, stock: 10 },
    { name: 'Montre Garmin Forerunner 955', description: 'Montre GPS running avec cartographie, métriques avancées et autonomie 42h.', price: 5499.00, categoryIndex: 4, stock: 22 },
    { name: 'Sac de Sport Nike Brasilia', description: 'Grand sac de sport avec compartiment chaussures, tissu résistant à l\'eau.', price: 349.00, categoryIndex: 4, stock: 70 },
    { name: 'Raquette Tennis Wilson Pro', description: 'Raquette professionnelle graphite, équilibre parfait puissance/contrôle.', price: 1999.00, categoryIndex: 4, stock: 15 },

    // Beauté & Santé (category 5)
    { name: 'Coffret Parfum Dior Sauvage', description: 'Eau de parfum 100ml + gel douche + baume après-rasage. Fragrance boisée épicée.', price: 1599.00, categoryIndex: 5, stock: 35 },
    { name: 'Crème Anti-Âge La Mer', description: 'Crème de la Mer originale 60ml, régénération cellulaire miraculeuse.', price: 3999.00, categoryIndex: 5, stock: 20 },
    { name: 'Sèche-Cheveux Dyson Supersonic', description: 'Sèche-cheveux révolutionnaire avec contrôle intelligent de la chaleur.', price: 4499.00, categoryIndex: 5, stock: 30 },
    { name: 'Palette Maquillage Urban Decay', description: 'Palette Naked Heat 12 teintes chaudes, fards haute pigmentation.', price: 599.00, categoryIndex: 5, stock: 45 },
    { name: 'Brosse à Dents Électrique Oral-B', description: 'Brosse connectée avec capteur de pression, 6 modes de brossage.', price: 1299.00, categoryIndex: 5, stock: 55 },

    // Livres & Papeterie (category 6)
    { name: 'L\'Alchimiste - Paulo Coelho', description: 'Roman initiatique best-seller mondial, édition collector reliée cuir.', price: 199.00, categoryIndex: 6, stock: 150 },
    { name: 'Agenda 2026 Moleskine', description: 'Agenda semainier cuir noir, papier ivoire 70g, format large.', price: 349.00, categoryIndex: 6, stock: 80 },
    { name: 'Stylo Montblanc Meisterstück', description: 'Stylo bille iconique en résine précieuse noire, attributs plaqués or.', price: 4999.00, categoryIndex: 6, stock: 12 },
    { name: 'Box Papeterie Premium', description: 'Coffret complet: carnets, stylos, surligneurs, post-it premium.', price: 599.00, categoryIndex: 6, stock: 40 },

    // Jouets & Enfants (category 7)
    { name: 'LEGO Star Wars Millennium Falcon', description: 'Set collector 7541 pièces, maquette détaillée du vaisseau iconique.', price: 8999.00, categoryIndex: 7, stock: 8 },
    { name: 'Console Nintendo Switch OLED', description: 'Console portable avec écran OLED 7 pouces, Joy-Con améliorés.', price: 3999.00, categoryIndex: 7, stock: 25 },
    { name: 'Poupée Barbie Dreamhouse', description: 'Maison de rêve Barbie 3 étages, piscine, ascenseur, 70+ accessoires.', price: 2499.00, categoryIndex: 7, stock: 18 },
    { name: 'Drone DJI Mini 3', description: 'Drone compact 249g, caméra 4K, autonomie 38min, idéal débutants.', price: 5999.00, categoryIndex: 7, stock: 15 },
    { name: 'Peluche Géante Ours 120cm', description: 'Peluche XXL ultra-douce, rembourrage hypoallergénique, lavable.', price: 599.00, categoryIndex: 7, stock: 30 },
  ];

  const products = await Promise.all(
    productsData.map((product, index) =>
      prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: categories[product.categoryIndex].id,
          createdAt: randomPastDate(300 - index * 5),
          inventory: {
            create: { quantity: product.stock },
          },
          images: {
            create: [
              { imageUrl: `product-${index + 1}-main.jpg` },
              { imageUrl: `product-${index + 1}-alt1.jpg` },
            ],
          },
        },
        include: { inventory: true, images: true },
      })
    )
  );
  console.log(`✅ Created ${products.length} products with inventory and images`);

  // ==================== ORDERS (Historical Data) ====================
  const orderStatuses = [status.DELIVERED, status.DELIVERED, status.DELIVERED, status.SHIPPED, status.PAID, status.PENDING];
  const orders: any[] = [];

  // Generate 50 historical orders
  for (let i = 0; i < 50; i++) {
    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const orderDate = randomPastDate(300);
    const orderStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    
    // Random products for this order (1-4 items)
    const numItems = Math.floor(Math.random() * 4) + 1;
    const selectedProducts: { product: typeof products[0]; quantity: number }[] = [];
    const usedProductIds = new Set<number>();
    
    for (let j = 0; j < numItems; j++) {
      let randomProduct;
      do {
        randomProduct = products[Math.floor(Math.random() * products.length)];
      } while (usedProductIds.has(randomProduct.id));
      
      usedProductIds.add(randomProduct.id);
      selectedProducts.push({
        product: randomProduct,
        quantity: Math.floor(Math.random() * 3) + 1,
      });
    }

    const total = selectedProducts.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        clientId: randomClient.id,
        status: orderStatus,
        total: Math.round(total * 100) / 100,
        paymentIntentId: orderStatus !== status.PENDING ? `pi_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}` : null,
        createdAt: orderDate,
        items: {
          create: selectedProducts.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
    orders.push(order);
  }
  console.log(`✅ Created ${orders.length} orders with items`);

  // ==================== SUMMARY ====================
  console.log('\n📊 SEED SUMMARY:');
  console.log('================');
  console.log(`📁 Categories: ${categories.length}`);
  console.log(`👥 Users: ${clients.length + 1} (1 admin + ${clients.length} clients)`);
  console.log(`📦 Products: ${products.length}`);
  console.log(`🛒 Orders: ${orders.length}`);
  console.log(`📋 Order Items: ${orders.reduce((sum, o) => sum + o.items.length, 0)}`);

  console.log('\n🔑 LOGIN CREDENTIALS:');
  console.log('=====================');
  console.log('👤 Admin: admin@youshop.ma / Admin@123');
  console.log('👤 Client: sara.benali@gmail.com / Client@123');
  console.log('👤 Client: youssef.el.amrani@gmail.com / Client@123');

  console.log('\n✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });