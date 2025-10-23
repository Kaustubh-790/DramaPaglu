import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
// import dramaRoutes from './routes/dramaRoutes.js';
// Import other routes as we create them
// import userListRoutes from './routes/userListRoutes.js';
// import recommendationRoutes from './routes/recommendationRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON request bodies

// API Routes
// app.use("/api/dramas", dramaRoutes);
// app.use('/api/userlist', userListRoutes);
// app.use('/api/recommendations', recommendationRoutes);

// Simple base route
app.get("/", (req, res) => {
  res.send("DramaPaglu Backend API is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
