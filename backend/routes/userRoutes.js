import express from "express";
import {
  registerUser,
  googleSignIn,
  getUserProfile,
} from "../controller/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", protect, registerUser);
router.post("/google", protect, googleSignIn);
router.get("/profile", protect, getUserProfile);

export default router;
