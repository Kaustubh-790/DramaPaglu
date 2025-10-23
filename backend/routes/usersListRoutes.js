import express from "express";
import {
  getMyList,
  updateListItem,
  deleteListItem,
} from "../controller/userListController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyList);

router.patch("/:id", updateListItem);

router.delete("/:id", deleteListItem);

export default router;
