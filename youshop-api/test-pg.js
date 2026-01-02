const { Client } = require('pg');

async function testPostgres() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'youshop',
    user: 'postgres',
    password: 'password123',
  });

  try {
    await client.connect();
    console.log('✅ Connexion PostgreSQL directe réussie');
    
    const result = await client.query('SELECT NOW()');
    console.log('📅 Timestamp:', result.rows[0].now);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

testPostgres();