import express from "express";
import {
  addDrama,
  getAllDramas,
  getDramaById,
  getTopDramas,
  getNewReleases,
  searchDramas,
} from "../controller/dramaController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addDrama);
router.get("/", getAllDramas);
router.get("/search", searchDramas);
router.get("/:id", getDramaById);
router.get("/scrape/top", getTopDramas);
router.get("/scrape/new-releases", getNewReleases);

export default router;
