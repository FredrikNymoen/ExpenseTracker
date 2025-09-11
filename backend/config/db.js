import neo4j from "neo4j-driver";
import dotenv from "dotenv";
dotenv.config();

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

// Graceful shutdown
process.on("SIGINT", async () => {
  await driver.close();
  process.exit(0);
});