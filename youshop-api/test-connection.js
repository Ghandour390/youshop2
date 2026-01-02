const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Connexion base de données réussie');
    
    // Test de migration
    console.log('🔄 Vérification des tables...');
    await prisma.user.findMany({ take: 1 });
    console.log('✅ Tables accessibles');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();