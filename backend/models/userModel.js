import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Firebase UID
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    photoURL: {
      type: String,
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
