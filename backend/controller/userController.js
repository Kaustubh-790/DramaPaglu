import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const { uid } = req.user;
  console.log("Registering user:", { uid, email, name });

  const existingUser = await User.findById(uid);
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email already in use");
  }

  const user = await User.create({
    _id: uid,
    name,
    email,
  });

  console.log("User registered:", user._id);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL || null,
  });
});

const googleSignIn = asyncHandler(async (req, res) => {
  const { uid, email, name, picture } = req.user;

  console.log("Google sign-in attempt:", { uid, email, name });

  let user = await User.findById(uid);

  if (user) {
    console.log("User found, updating info");
    user.name = name;
    user.photoURL = picture || user.photoURL;
    await user.save();
  } else {
    console.log("📝 User not found, creating new account");

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error(
        "This email is already registered with a different account. Please use email/password login."
      );
    }

    user = await User.create({
      _id: uid,
      email,
      name,
      photoURL: picture || "",
    });

    console.log("New user created:", user._id);
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL || null,
  });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { uid } = req.user;

  console.log("Fetching profile for:", uid);

  const user = await User.findById(uid);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL || null,
  });
});

export { registerUser, googleSignIn, getUserProfile };
