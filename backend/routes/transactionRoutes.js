import { Router } from "express";
import {
  createTransaction,
  getUserTransactions,
} from "../controllers/transactionController.js";

const router = Router();

// Create a transaction between two users
router.post("/", createTransaction);

// Get transactions for a specific user
router.get("/user/:id", getUserTransactions);

export default router;
