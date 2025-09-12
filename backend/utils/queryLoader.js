import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Loads a .cypher file from the /cypher directory
export function loadQuery(fileName) {
  const filePath = path.join(__dirname, "../cypher", `${fileName}.cypher`);
  return readFileSync(filePath, "utf-8");
}
