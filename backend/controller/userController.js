import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import axios from "axios";
import sharp from "sharp";
import FormData from "form-data";

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
    console.log("User not found, creating new account");

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

const uploadToImgBB = async (buffer) => {
  if (!process.env.IMGBB_API_KEY) {
    throw new Error("ImgBB API key is not configured.");
  }

  const optimizedBuffer = await sharp(buffer)
    .resize({ width: 300, height: 300, fit: "cover" })
    .webp({ quality: 80 })
    .toBuffer();

  const formData = new FormData();
  formData.append("image", optimizedBuffer, {
    filename: "profile.webp",
    contentType: "image/webp",
  });

  try {
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    if (response.data && response.data.data && response.data.data.url) {
      return response.data.data.url;
    } else {
      console.error("ImgBB upload failed, response:", response.data);
      throw new Error("Failed to upload image to ImgBB.");
    }
  } catch (error) {
    console.error(
      "Error uploading to ImgBB:",
      error.response?.data || error.message
    );
    throw new Error("Failed to upload image.");
  }
};

const updateUserProfile = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const { name } = req.body;

  console.log("Updating profile for:", uid);
  console.log("Received name:", name);
  console.log("Received file:", req.file ? req.file.originalname : "No file");

  const user = await User.findById(uid);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (name && name.trim()) {
    user.name = name.trim();
  }

  let newPhotoURL = user.photoURL;
  if (req.file) {
    try {
      console.log(
        `Optimizing and uploading ${req.file.originalname} to ImgBB...`
      );
      newPhotoURL = await uploadToImgBB(req.file.buffer);
      user.photoURL = newPhotoURL;
      console.log("ImgBB Upload successful, URL:", newPhotoURL);
    } catch (uploadError) {
      console.error("Profile picture upload failed:", uploadError);

      res.status(500);
      throw new Error(
        `Failed to upload profile picture: ${uploadError.message}`
      );
    }
  }

  const updatedUser = await user.save();

  console.log("Profile updated successfully for:", updatedUser._id);

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    photoURL: updatedUser.photoURL || null,
  });
});

export { registerUser, googleSignIn, getUserProfile, updateUserProfile };
