import express from "express";
import {
  getRecommendationsByGenre,
  getPersonalizedRecommendations,
} from "../controller/recommendationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:genre", getRecommendationsByGenre);
router.get("/personalized/:genre", protect, getPersonalizedRecommendations);

export default router;
