import { PrismaService } from './src/prisma.service';

async function testPrismaConnection() {
  const prisma = new PrismaService();
  
  try {
    await prisma.onModuleInit();
    console.log('✅ Connexion Prisma réussie');
    
    const userCount = await prisma.user.count();
    console.log(`📊 Utilisateurs: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();