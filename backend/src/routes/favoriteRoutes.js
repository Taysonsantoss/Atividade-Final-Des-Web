import express from "express";
import {
  toggleFavorite,
  getFavorites,
} from "../controllers/favoritesController.js";

const router = express.Router();

router.get("/", getFavorites);
router.get("/toggle", toggleFavorite);

export default router;
