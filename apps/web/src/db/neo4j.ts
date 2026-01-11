import neo4j from 'neo4j-driver';

const NEO4J_URI = process.env.NEO4J_URI;
const NEO4J_USER = process.env.NEO4J_USER;
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD;

// Prevent creating multiple driver instances in development due to hot reloading
declare global {
  // eslint-disable-next-line no-var
  var neo4jDriver: ReturnType<typeof neo4j.driver> | undefined;
}

const createDriver = () => {
  if (!NEO4J_URI || !NEO4J_USER || !NEO4J_PASSWORD) {
    // Return undefined or throw error depending on strictness preference
    // For now, we'll log a warning and return undefined to avoid crashing if not configured immediately
    console.warn(
      'Missing Neo4j environment variables (NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)'
    );
    return undefined;
  }

  return neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
};

export const driver = global.neo4jDriver ?? createDriver();

if (process.env.NODE_ENV !== 'production') {
  global.neo4jDriver = driver;
}

export const getNeo4jSession = () => {
  if (!driver) {
    throw new Error(
      'Neo4j driver not initialized. Check environment variables.'
    );
  }
  return driver.session();
};
