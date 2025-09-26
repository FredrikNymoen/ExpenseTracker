import neo4j from "neo4j-driver";
import dotenv from "dotenv";

// Only load .env in local development
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  dotenv.config();
}

const { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD } = process.env;

if (!NEO4J_URI || !NEO4J_USERNAME || !NEO4J_PASSWORD) {
  throw new Error("Missing Neo4j environment variables.");
}

export const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD),
  // Good defaults for cloud connections
  { /* encrypt: true by default for neo4j+s */ }
);

export async function getSession(database = undefined) {
  // database can be left undefined for Aura Free (single DB)
  return driver.session({ database, defaultAccessMode: neo4j.session.WRITE });
}

// Graceful shutdown (disabled for serverless)
// process.on("SIGINT", async () => {
//   await driver.close();
//   process.exit(0);
// });