import mongoose from "mongoose";

const userListSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    dramaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drama",
      required: true,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["planned", "watching", "completed"],
      default: "planned",
    },
  },
  {
    timestamps: true,
  }
);

userListSchema.index({ userId: 1, dramaId: 1 }, { unique: true });

const UserList = mongoose.model("UserList", userListSchema);

export default UserList;
