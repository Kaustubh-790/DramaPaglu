import axios from "axios";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: BACKEND_URL,
});

export default api;
