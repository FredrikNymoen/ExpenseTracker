import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  ensureMe,
  patchUser,
  deleteMe,
  changePassword,
  recalculateRiskScore,
} from "../controllers/userController.js";

const router = Router();

// DELETE /api/me -> delete current user from database and Cognito
router.delete("/", auth, deleteMe);

// PATCH /api/me -> update current user's profile (img, name)
router.patch("/", auth, patchUser);

// POST /api/me/change-password -> change user's password in Cognito
router.post("/change-password", auth, changePassword);

// POST /api/me/recalculate-risk -> recalculate user's risk score based on activity
router.post("/recalculate-risk", auth, recalculateRiskScore);

// GET /api/me -> get current user's profile
router.get("/", auth, ensureMe);

export default router;
