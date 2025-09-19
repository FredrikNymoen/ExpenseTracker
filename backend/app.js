import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import { auth } from "./middleware/auth.js";
import { ensureMe } from "./controllers/userController.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// health
app.get("/health", (_req, res) => res.json({ ok: true }));

// routes
app.get("/api/me", auth, ensureMe);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);

export default app;
