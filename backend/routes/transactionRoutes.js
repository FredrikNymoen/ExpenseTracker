import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  createTransaction,
  getUserTransactions,
} from "../controllers/transactionController.js";

// api/transactions
const router = Router();

// Create a transaction between two users
router.post("/", auth, createTransaction);

// Get transactions for a specific user
router.get("/user/:id", getUserTransactions);

export default router;
