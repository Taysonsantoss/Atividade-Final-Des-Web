import express from "express";
import { listActors } from "../controllers/actorController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/", authenticateUser, listActors);

export default router;
