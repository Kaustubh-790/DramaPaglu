import express from "express";
import {
  registerUser,
  googleSignIn,
  updateUserProfile,
  getUserProfile,
} from "../controller/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/register", protect, registerUser);
router.post("/google", protect, googleSignIn);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, upload.single("profilePic"), updateUserProfile);
export default router;
