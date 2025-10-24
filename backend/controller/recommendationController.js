import axios from "axios";
import Recommendation from "../models/recommendationModel.js";
import UserList from "../models/userListModel.js";
import mongoose from "mongoose";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;

export const getRecommendationsByGenre = asyncHandler(async (req, res) => {
  const { genre } = req.params;
  const cacheKey = `generic-${genre.toLowerCase()}`;
  const now = new Date();

  const cached = await Recommendation.findOne({ genre: cacheKey });

  if (cached && now - cached.generatedAt < CACHE_DURATION_MS) {
    console.log(`Serving cached generic recommendations for ${genre}`);
    return res.json(cached);
  }
  console.log(
    `No valid cache for generic recommendations for ${genre}, fetching...`
  );

  try {
    const { data: llmRecommendations } = await axios.get(
      `${process.env.PYTHON_MICROSERVICE_URL}/recommend`,
      { params: { genre } }
    );

    const updatedRecommendations = await Recommendation.findOneAndUpdate(
      { genre: cacheKey },
      {
        genre: cacheKey,
        generatedAt: new Date(),
        recommendations: llmRecommendations.recommendations,
      },
      { new: true, upsert: true }
    );

    res.json(updatedRecommendations);
  } catch (error) {
    console.error(
      "Python recommendation service error (Generic):",
      error.response?.data || error.message
    );
    if (cached) {
      console.warn(
        `Python service failed, serving stale generic cache for ${genre}`
      );
      return res.json(cached);
    }
    res.status(500);
    throw new Error("Failed to fetch recommendations from external service.");
  }
});

export const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const { genre } = req.params;
  const userId = req.user.uid;
  const cacheKey = `user-${userId}-${genre.toLowerCase()}`;
  const now = new Date();

  const cached = await Recommendation.findOne({ genre: cacheKey });

  if (cached && now - cached.generatedAt < CACHE_DURATION_MS) {
    console.log(
      `Serving cached personalized recommendations for user ${userId}, genre ${genre}`
    );
    return res.json(cached);
  }
  console.log(
    `No valid cache for personalized recommendations for user ${userId}, genre ${genre}, fetching...`
  );

  try {
    const userListItems = await UserList.find({ userId }).populate(
      "dramaId",
      "title"
    );
    const excludeTitles = userListItems
      .map((item) => item.dramaId?.title)
      .filter((title) => !!title);

    console.log(`Excluding ${excludeTitles.length} titles for user ${userId}`);

    const { data: llmRecommendations } = await axios.get(
      `${process.env.PYTHON_MICROSERVICE_URL}/recommend`,
      { params: { genre, exclude_titles: JSON.stringify(excludeTitles) } }
    );

    if (
      !llmRecommendations ||
      !Array.isArray(llmRecommendations.recommendations)
    ) {
      throw new Error("Invalid response structure from recommendation service");
    }

    const updatedRecommendations = await Recommendation.findOneAndUpdate(
      { genre: cacheKey },
      {
        genre: cacheKey,
        generatedAt: new Date(),
        recommendations: llmRecommendations.recommendations,
      },
      { new: true, upsert: true }
    );

    res.json(updatedRecommendations);
  } catch (error) {
    console.error(
      "Python recommendation service error (Personalized):",
      error.response?.data || error.message
    );
    if (cached) {
      console.warn(
        `Python service failed, serving stale personalized cache for user ${userId}, genre ${genre}`
      );
      return res.json(cached);
    }
    console.warn(
      `Personalized fetch failed for ${userId}/${genre}, falling back to generic.`
    );
    try {
      const { data: genericRecsData } = await axios.get(
        `http://localhost:${
          process.env.PORT || 5001
        }/api/recommendations/${genre}`
      );
      if (genericRecsData && genericRecsData.recommendations) {
        return res.json(genericRecsData);
      } else {
        throw new Error("Fallback to generic recommendations also failed.");
      }
    } catch (fallbackError) {
      console.error(
        "Fallback to generic recommendations failed:",
        fallbackError.message
      );
      res.status(500);
      throw new Error("Failed to fetch recommendations from external service.");
    }
  }
});
