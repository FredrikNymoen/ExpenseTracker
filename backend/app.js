import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import meRoutes from "./routes/meRoutes.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "50mb" })); // Allow large images
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// health
app.get("/health", (_req, res) => res.json({ ok: true }));

// routes
app.use("/api/me", meRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);

export default app;
