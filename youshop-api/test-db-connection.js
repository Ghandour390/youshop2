const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');
    
    // Test simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Nombre d'utilisateurs: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();