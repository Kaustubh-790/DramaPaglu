import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
  genre: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
    expires: "12h",
  },
  recommendations: [
    {
      _id: false,
      title: String,
      year: Number,
      reason: String,
      description: String,
      status: String,
      posterUrl: String,
      sourceUrl: String,
      genres: [String],
    },
  ],
});

const Recommendation = mongoose.model("Recommendation", recommendationSchema);

export default Recommendation;
