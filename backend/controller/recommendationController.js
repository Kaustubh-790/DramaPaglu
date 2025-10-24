import axios from "axios";
import Recommendation from "../models/recommendationModel.js";
import UserList from "../models/userListModel.js";
import mongoose from "mongoose";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

const fetchFromPythonService = async (genre, excludeTitles = []) => {
  const params = { genre };
  if (excludeTitles.length > 0) {
    params.exclude_titles = JSON.stringify(excludeTitles);
  }
  const { data } = await axios.get(
    `${process.env.PYTHON_MICROSERVICE_URL}/recommend`,
    { params }
  );
  if (!data || !Array.isArray(data.recommendations)) {
    throw new Error("Invalid response structure from recommendation service");
  }
  return data;
};

export const getRecommendationsByGenre = asyncHandler(async (req, res) => {
  const { genre } = req.params;
  const { refresh } = req.query;
  const cacheKey = `generic-${genre.toLowerCase()}`;
  const now = new Date();

  if (!refresh) {
    const cached = await Recommendation.findOne({ genre: cacheKey });
    if (cached && now - cached.generatedAt < CACHE_DURATION_MS) {
      return res.json(cached);
    }
  }

  try {
    const llmRecommendations = await fetchFromPythonService(genre);

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
    const cached = await Recommendation.findOne({ genre: cacheKey });
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
  const { refresh } = req.query;
  const userId = req.user.uid;
  const cacheKey = `user-${userId}-${genre.toLowerCase()}`;
  const now = new Date();

  if (!refresh) {
    const cached = await Recommendation.findOne({ genre: cacheKey });
    if (cached && now - cached.generatedAt < CACHE_DURATION_MS) {
      return res.json(cached);
    }
  }

  try {
    const userListItems = await UserList.find({ userId }).populate(
      "dramaId",
      "title"
    );
    const excludeTitles = userListItems
      .map((item) => item.dramaId?.title)
      .filter((title) => !!title);

    const llmRecommendations = await fetchFromPythonService(
      genre,
      excludeTitles
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
      "Python recommendation service error (Personalized):",
      error.response?.data || error.message
    );
    const cached = await Recommendation.findOne({ genre: cacheKey });
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
      const tempApi = axios.create({
        baseURL: `http://localhost:${process.env.PORT || 5001}/api`,
      });
      const { data: genericRecsData } = await tempApi.get(
        `/recommendations/${genre}`
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
