import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

async function testConnection() {
  console.log('Testing Neo4j connection...');

  // Dynamic import to ensure env vars are loaded before the module is evaluated
  const { driver, getNeo4jSession } = await import('../src/db/neo4j');

  console.log('URI:', process.env.NEO4J_URI);
  // Mask password for security in logs
  console.log('User:', process.env.NEO4J_USER);
  console.log('Password set:', !!process.env.NEO4J_PASSWORD);

  if (!driver) {
    console.error('❌ Driver creation failed. Missing environment variables?');
    // Check specifically for placeholders
    if (process.env.NEO4J_URI?.includes('your-instance-id')) {
      console.error(
        '⚠️  It looks like you are using the placeholder URI. Please update .env.local with your actual Neo4j Cloud credentials.'
      );
    }
    process.exit(1);
  }

  try {
    // 1. Verify basic connectivity
    console.log('Attempting to verify connectivity...');
    const serverInfo = await driver.verifyConnectivity();
    console.log('✅ Connectivity verification successful!');
    console.log('Server info:', serverInfo);

    // 2. Run a simple query
    const session = getNeo4jSession();
    try {
      const result = await session.run('RETURN "Hello Neo4j" AS message');
      const message = result.records[0].get('message');
      console.log(`✅ Test query result: ${message}`);
    } finally {
      await session.close();
    }
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    if (error.code === 'ServiceUnavailable') {
      console.error('Hint: Check your URI and ensure the database is running.');
    }
    if (error.code === 'Neo.ClientError.Security.Unauthorized') {
      console.error('Hint: Check your username and password.');
    }
  } finally {
    await driver.close();
  }
}

testConnection();
