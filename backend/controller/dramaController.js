import axios from "axios";
import Drama from "../models/dramaModel.js";
import UserList from "../models/userListModel.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const addDrama = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const userId = req.user.uid;

  if (!title) {
    res.status(400);
    throw new Error("Drama title is required");
  }

  let drama;

  drama = await Drama.findOne({
    title: { $regex: new RegExp(`^${title}$`, "i") },
  });

  if (!drama) {
    try {
      const { data: scrapedData } = await axios.get(
        `${process.env.PYTHON_MICROSERVICE_URL}/fetch`,
        { params: { title } }
      );

      drama = new Drama({
        title: scrapedData.title,
        altTitles: scrapedData.altTitles || [],
        year: scrapedData.year,
        genres: scrapedData.genres,
        posterUrl: scrapedData.posterUrl,
        description: scrapedData.description,
        cast: scrapedData.cast,
        rating: scrapedData.rating,
        sourceUrl: scrapedData.sourceUrl,
        status: scrapedData.status,
      });
      await drama.save();
    } catch (error) {
      console.error("Python scraper service error:", error.message);
      res.status(500);
      throw new Error("Failed to fetch drama details from external service.");
    }
  }

  const dramaId = drama._id;

  const alreadyAdded = await UserList.findOne({ userId, dramaId });

  if (alreadyAdded) {
    res.status(400);
    throw new Error("This drama is already on your list");
  }

  const userListItem = new UserList({
    userId,
    dramaId,
    status: "planned",
    favorite: false,
  });

  await userListItem.save();

  const addedItem = await userListItem.populate("dramaId");

  res.status(201).json({
    id: addedItem.dramaId._id,
    title: addedItem.dramaId.title,
    poster: addedItem.dramaId.posterUrl,
    genres: addedItem.dramaId.genres,
    year: addedItem.dramaId.year,
    status: addedItem.status,
    favorite: addedItem.favorite,
  });
});

export const getAllDramas = asyncHandler(async (req, res) => {
  const dramas = await Drama.find({}).sort({ createdAt: -1 });
  res.json(dramas);
});

export const getDramaById = asyncHandler(async (req, res) => {
  const drama = await Drama.findById(req.params.id);

  if (drama) {
    res.json(drama);
  } else {
    res.status(404);
    throw new Error("Drama not found");
  }
});
