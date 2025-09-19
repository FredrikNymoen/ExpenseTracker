import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import users from "./routes/userRoutes.js";
import transactions from "./routes/transactionRoutes.js";
import { driver } from "./config/db.js";
import { auth } from "./middleware/auth.js";
import { ensureMe } from "./controllers/userController.js";

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true })); // Can be reached from anywhere
app.use(express.json());

app.get("/api/me", auth, ensureMe);
app.use("/api/users", users);
app.use("/api/transactions", transactions);

const PORT = process.env.PORT || 5000;

// Ensure driver can connect before starting server
driver
  .getServerInfo()
  .then((info) => {
    console.log("Connected to Neo4j:", info?.address || "ok");
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Neo4j connection failed:", err);
    process.exit(1);
  });
