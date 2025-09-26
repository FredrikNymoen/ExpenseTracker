import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import meRoutes from "./routes/meRoutes.js";

const app = express();
// Always use Express CORS for proper OPTIONS handling
app.use(cors({
  origin: ["https://d2m47o9qwrddqu.cloudfront.net", "https://veupdvifbj.execute-api.eu-north-1.amazonaws.com", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token", "x-default-name"]
}));
app.use(express.json({ limit: "50mb" })); // Allow large images
// app.use(express.urlencoded({ limit: "50mb", extended: true })); // Disabled for serverless compatibility

// health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// routes
app.use("/api/me", meRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);

export default app;
