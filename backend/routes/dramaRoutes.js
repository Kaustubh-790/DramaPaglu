import express from "express";
import {
  addDrama,
  getAllDramas,
  getDramaById,
} from "../controller/dramaController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addDrama);

router.get("/", getAllDramas);

router.get("/:id", getDramaById);

export default router;
