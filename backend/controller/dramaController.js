import axios from "axios";
import Drama from "../models/dramaModel.js";
import UserList from "../models/userListModel.js";

// Helper function to handle async routes
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Add a new drama by title.
 * If it doesn't exist in DB, scrape it via Python service.
 * Then, add it to the user's list.
 * @route   POST /api/dramas/add
 * @access  Private
 */
export const addDrama = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const userId = req.user.uid; // Attached by our 'protect' middleware

  if (!title) {
    res.status(400);
    throw new Error("Drama title is required");
  }

  let drama;

  // 1. Check if drama already exists in our 'dramas' collection
  // We use a case-insensitive regex for a better match
  drama = await Drama.findOne({
    title: { $regex: new RegExp(`^${title}$`, "i") },
  });

  // 2. If not, call Python microservice to scrape
  if (!drama) {
    try {
      const { data: scrapedData } = await axios.get(
        `${process.env.PYTHON_MICROSERVICE_URL}/fetch`,
        { params: { title } }
      );

      // 3. Save the new drama to the 'dramas' collection
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

  // 4. Add the drama (either found or newly created) to the user's list
  const dramaId = drama._id;

  // Check if it's already on the user's list
  const alreadyAdded = await UserList.findOne({ userId, dramaId });

  if (alreadyAdded) {
    res.status(400);
    throw new Error("This drama is already on your list");
  }

  // Add to user's list with default 'planned' status
  const userListItem = new UserList({
    userId,
    dramaId,
    status: "planned",
    favorite: false,
  });

  await userListItem.save();

  // Populate the drama details before sending back
  const addedItem = await userListItem.populate("dramaId");

  // Respond with the new UserList item (which contains the drama details)
  // This matches the frontend's MyList.jsx expectation
  res.status(201).json({
    id: addedItem.dramaId._id,
    title: addedItem.dramaId.title,
    poster: addedItem.dramaId.posterUrl,
    genres: addedItem.dramaId.genres,
    year: addedItem.dramaId.year,
    status: addedItem.status, // 'planned'
    favorite: addedItem.favorite, // false
  });
});

/**
 * @desc    Fetch all dramas
 * @route   GET /api/dramas
 * @access  Public
 */
export const getAllDramas = asyncHandler(async (req, res) => {
  const dramas = await Drama.find({}).sort({ createdAt: -1 });
  res.json(dramas);
});

/**
 * @desc    Get single drama by ID
 * @route   GET /api/dramas/:id
 * @access  Public
 */
export const getDramaById = asyncHandler(async (req, res) => {
  const drama = await Drama.findById(req.params.id);

  if (drama) {
    res.json(drama);
  } else {
    res.status(404);
    throw new Error("Drama not found");
  }
});
