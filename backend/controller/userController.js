// filename: backend/controller/userController.js
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

// --- registerUser (Email/Pass) ---
// This function is for *new* email/pass signups only.
// We must check if the email already exists.
const registerUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const { uid } = req.user; // UID from Firebase token

  // Check if this UID is already in our DB (shouldn't happen, but good check)
  const userExistsByUID = await User.findById(uid);
  if (userExistsByUID) {
    res.status(400);
    throw new Error("User already exists in database");
  }

  // Check if this EMAIL is already in our DB (e.g., from Google signup)
  const userExistsByEmail = await User.findOne({ email });
  if (userExistsByEmail) {
    res.status(400);
    throw new Error(
      "An account with this email already exists. Please log in."
    );
  }

  // Create new user
  const user = await User.create({
    _id: uid, // Use Firebase UID as the _id
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

// --- FIXED googleSignIn ---
// This function handles "Log in with Google".
// It finds a user by EMAIL.
// - If found, it updates their info (name, photo, and *Firebase UID*).
// - If not found, it creates a new user with all info.
// This is the correct "upsert" logic for OAuth.
const googleSignIn = asyncHandler(async (req, res) => {
  const { uid, email, name, picture } = req.user;

  // Find user by EMAIL, not UID
  const user = await User.findOneAndUpdate(
    { email: email }, // Query by email
    {
      // --- Data to set/update ---
      $set: {
        _id: uid, // Update the UID to match the Google Firebase UID
        name: name,
        photoURL: picture,
      },
      // --- Data to set ONLY on create (insert) ---
      $setOnInsert: {
        email: email,
      },
    },
    {
      upsert: true, // Create if email not found
      new: true, // Return the (new or updated) document
      setDefaultsOnInsert: true,
    }
  );

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
    });
  } else {
    res.status(400);
    throw new Error("Could not sign in with Google");
  }
});

// --- getUserProfile ---
// This is fine as-is. It finds the user by their UID,
// which is attached to the token by the 'protect' middleware.
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
