import express from "express";
import { getRecommendationsByGenre } from "../controller/recommendationController.js";

const router = express.Router();

router.get("/:genre", getRecommendationsByGenre);

export default router;
