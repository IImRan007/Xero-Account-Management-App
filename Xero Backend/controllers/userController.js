const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

// @desc Register a new user POST Request
// @route /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, isAdmin, company } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password
  // const salt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = new User({
    name,
    username,
    email,
    password,
    isAdmin,
    company,
  });

  await newUser.save();

  // Check if user was successfully saved
  if (!newUser._id) {
    res.status(400);
    throw new Error("Failed to create user");
  }

  res.status(201).json({
    success: true,
    _id: newUser._id,
    name: newUser.name,
    username: newUser.username,
    email: newUser.email,
    isAdmin: newUser.isAdmin,
    company: newUser.company,
    token: generateToken(newUser._id),
  });
});

// @desc Login a new user POST Request
// @route /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log(user);

  // let pass = await bcrypt.compare(password, user?.password);
  // console.log(pass);

  // Check user and password match
  if (user) {
    res.status(200).json({
      _id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      company: user.company,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  // if (user && (await bcrypt.compare(password, user.password))) {
  //   res.status(200).json({
  //     _id: user._id.toString(),
  //     name: user.name,
  //     username: user.username,
  //     email: user.email,
  //     company: user.company,
  //     isAdmin: user.isAdmin,
  //     token: generateToken(user._id),
  //   });
  // } else {
  //   res.status(401);
  //   throw new Error("Invalid credentials");
  // }
});

// @desc Get current user GET Request
// @route /api/users/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    email: req.user.email,
    company: req.user.company,
  };

  res.status(200).json(user);
});

// @desc Create new user POST Request
// @route /api/users/create
// @access Private
const createUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, company, isAdmin } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = new User({
    name,
    username,
    email,
    password: hashedPassword,
    isAdmin,
    company,
  });

  await newUser.save();

  // Check if user was successfully saved
  if (!newUser._id) {
    res.status(400);
    throw new Error("Failed to create user");
  }

  res.status(201).json({
    _id: newUser._id,
    name: newUser.name,
    username: newUser.username,
    email: newUser.email,
    company: newUser.company,
    isAdmin: newUser.isAdmin,
  });
});

// @desc Get current user GET Request
// @route /api/users/all
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  res.status(200).json(users);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, username, email, password, company, isAdmin } = req.body;

  let hashedPassword;
  if (password) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  }

  let data = {
    name,
    username,
    email,
    password: hashedPassword,
    isAdmin,
    company,
  };

  const updatedUser = await User.findByIdAndUpdate(req.params.id, data, {
    new: true,
  });

  res.status(200).json(updatedUser);
});

const getSingleUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  // const data = {
  //   _id: user._id,
  //   name: user.name,
  //   username: user.username,
  //   email: user.email,
  //   isAdmin: user.isAdmin,
  //   company: user.company,
  // };

  res.status(200).json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true });
});

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  createUser,
  updateUser,
  getSingleUser,
  deleteUser,
};
