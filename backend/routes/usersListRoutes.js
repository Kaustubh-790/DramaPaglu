import express from "express";
import {
  getMyList,
  updateListItem,
  deleteListItem,
  getMyFavorites,
} from "../controller/userListController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyList);

router.patch("/:id", updateListItem);

router.delete("/:id", deleteListItem);

router.get("/favorites", getMyFavorites);

export default router;
