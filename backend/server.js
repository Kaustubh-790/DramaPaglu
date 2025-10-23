import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import dramaRoutes from "./routes/dramaRoutes.js";
import userListRoutes from "./routes/usersListRoutes.js";
// import recommendationRoutes from './routes/recommendationRoutes.js';
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// API Routes
app.get("/", (req, res) => {
  res.send("DramaPaglu Backend API is running...");
});

app.use("/api/dramas", dramaRoutes);
app.use("/api/userlist", userListRoutes);
// app.use('/api/recommendations', recommendationRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
