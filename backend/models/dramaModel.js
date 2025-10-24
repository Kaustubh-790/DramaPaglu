import mongoose from "mongoose";

const dramaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    altTitles: [String],
    year: {
      type: Number,
    },
    country: {
      type: String,
      default: "South Korea",
    },
    genres: [String],
    posterUrl: {
      type: String,
      required: true,
    },
    localPosterPath: String,
    description: {
      type: String,
    },
    cast: [String],
    rating: {
      type: String,
    },
    sourceUrl: {
      type: String,
    },
    type: {
      type: String,
      default: "drama",
    },
    status: {
      type: String,
      enum: ["completed", "ongoing", "upcoming"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

dramaSchema.index({ title: "text", altTitles: "text" });

const Drama = mongoose.model("Drama", dramaSchema);

export default Drama;
