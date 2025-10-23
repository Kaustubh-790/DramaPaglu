import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
  genre: {
    type: String,
    required: true,
    unique: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  recommendations: [
    {
      title: String,
      reason: String,
      posterUrl: String,
      sourceUrl: String,
    },
  ],
});

const Recommendation = mongoose.model("Recommendation", recommendationSchema);

export default Recommendation;
