import express from "express";
import {
  addDrama,
  getAllDramas,
  getDramaById,
} from "../controllers/dramaController.js";
import { protect } from "../middleware/authMiddleware.js"; // We'll create this next

const router = express.Router();

// @route   POST /api/dramas/add
// @desc    Add a new drama by title (scrapes if new) and add to user's list
// @access  Private
router.post("/add", protect, addDrama);

// @route   GET /api/dramas
// @desc    Fetch all dramas in the database
// @access  Public (or Private, depending on choice - let's start with Public)
router.get("/", getAllDramas);

// @route   GET /api/dramas/:id
// @desc    Get single drama details
// @access  Public
router.get("/:id", getDramaById);

export default router;
