import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import admin from "../config/firebaseAdmin.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const { uid } = req.user;

  const userExists = await User.findById(uid);

  if (userExists) {
    res.status(400);
    throw new Error("User already exists in database");
  }

  const user = await User.create({
    _id: uid,
    name,
    email,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const googleSignIn = asyncHandler(async (req, res) => {
  const { uid, email, name, picture } = req.user;

  const user = await User.findByIdAndUpdate(
    uid,
    {
      _id: uid,
      email,
      name,
      photoURL: picture,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL,
  });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.uid);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
    });
  } else {
    res.status(404);
    throw new Error("User not found in database");
  }
});

export { registerUser, googleSignIn, getUserProfile };
