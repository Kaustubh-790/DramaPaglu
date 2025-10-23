import axios from "axios";
import Recommendation from "../models/recommendationModel.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

export const getRecommendationsByGenre = asyncHandler(async (req, res) => {
  const { genre } = req.params;
  const now = new Date();

  const cached = await Recommendation.findOne({
    genre: { $regex: new RegExp(`^${genre}$`, "i") },
  });

  if (cached && now - cached.generatedAt < CACHE_DURATION_MS) {
    return res.json(cached);
  }

  try {
    const { data: llmRecommendations } = await axios.get(
      `${process.env.PYTHON_MICROSERVICE_URL}/recommend`,
      { params: { genre } }
    );

    const updatedRecommendations = await Recommendation.findOneAndUpdate(
      { genre: { $regex: new RegExp(`^${genre}$`, "i") } },
      {
        genre: genre,
        generatedAt: new Date(),
        recommendations: llmRecommendations.recommendations,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json(updatedRecommendations);
  } catch (error) {
    console.error("Python recommendation service error:", error.message);
    res.status(500);
    throw new Error("Failed to fetch recommendations from external service.");
  }
});
