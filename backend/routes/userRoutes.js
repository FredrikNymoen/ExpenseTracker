import { Router } from "express";
import { getUsers, addUser, getUser, deleteUser } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const router = Router();


// GET /api/users  -> list users
router.get("/", getUsers)

// POST /api/users  { id, name } -> create user
router.post("/", auth, addUser)

// GET /api/users/:id -> get one user
router.get("/:id", getUser)

// DELETE /api/users/:id -> delete user
router.delete("/:id", deleteUser);

export default router;