import axios from "axios";

const tmdbClient = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
    language: "en-US",
  },
});

export const getNewReleases = async () => {
  const response = await tmdbClient.get("/discover/tv", {
    params: {
      sort_by: "first_air_date.desc",
      with_origin_country: "KR",
      "first_air_date.gte": "2025-01-01",
    },
  });
  return response.data.results;
};

export default tmdbClient;
