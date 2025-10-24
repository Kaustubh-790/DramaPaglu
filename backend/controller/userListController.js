import UserList from "../models/userListModel.js";
import Drama from "../models/dramaModel.js";
import mongoose from "mongoose";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const getMyList = asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  const myList = await UserList.find({ userId })
    .populate("dramaId")
    .sort({ createdAt: -1 });

  const formattedList = myList
    .map((item) => {
      if (!item.dramaId) {
        return null;
      }
      return {
        id: item.dramaId._id,
        listId: item._id,
        title: item.dramaId.title,
        poster: item.dramaId.posterUrl,
        genres: item.dramaId.genres,
        year: item.dramaId.year,
        status: item.status,
        favorite: item.favorite,
      };
    })
    .filter((item) => item !== null);

  res.json(formattedList);
});

export const updateListItem = asyncHandler(async (req, res) => {
  const userId = req.user.uid;
  const dramaId = req.params.id;
  const { status, favorite } = req.body;

  if (!mongoose.Types.ObjectId.isValid(dramaId)) {
    res.status(400);
    throw new Error("Invalid Drama ID");
  }

  const listItem = await UserList.findOne({ userId, dramaId });

  if (!listItem) {
    res.status(404);
    throw new Error("Item not found on your list");
  }

  if (status) {
    listItem.status = status;
  }
  if (typeof favorite === "boolean") {
    listItem.favorite = favorite;
  }

  const updatedItem = await listItem.save();
  const populatedItem = await updatedItem.populate("dramaId");

  res.json({
    id: populatedItem.dramaId._id,
    listId: populatedItem._id,
    title: populatedItem.dramaId.title,
    poster: populatedItem.dramaId.posterUrl,
    genres: populatedItem.dramaId.genres,
    year: populatedItem.dramaId.year,
    status: populatedItem.status,
    favorite: populatedItem.favorite,
  });
});

export const deleteListItem = asyncHandler(async (req, res) => {
  const userId = req.user.uid;
  const dramaId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(dramaId)) {
    res.status(400);
    throw new Error("Invalid Drama ID");
  }

  const listItem = await UserList.findOne({ userId, dramaId });

  if (!listItem) {
    res.status(404);
    throw new Error("Item not found on your list");
  }

  await listItem.deleteOne();

  res.json({ message: "Drama removed from list", dramaId: dramaId });
});
