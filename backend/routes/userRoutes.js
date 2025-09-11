import { Router } from "express";
import { getUsers, addUser, getUser } from "../controllers/userController.js";


const router = Router();


/**
 * Demo model:
 * (:User { id: string, name: string, createdAt: datetime })
 */


// GET /api/users  -> list users
router.get("/", getUsers)

// POST /api/users  { id, name } -> create user
router.post("/", addUser)

// GET /api/users/:id -> get one user
router.get("/:id", getUser)


export default router;