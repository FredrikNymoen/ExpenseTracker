import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// health
app.get("/health", (_req, res) => res.json({ ok: true }));

// routes
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);

export default app;
