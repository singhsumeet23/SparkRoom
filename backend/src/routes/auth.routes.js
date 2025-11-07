const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Helper function to generate the JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    const user = await User.create({ name, email, password });

    if (user) {
      // Registration Success
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error("Registration Error:", error); 
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. Find the user, explicitly selecting the password field for comparison
  const user = await User.findOne({ email }).select('+password');

  // 2. Check if the user exists AND if the password matches
  if (user && (await user.matchPassword(password))) {
    // Login Success
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      token: generateToken(user._id),
    });
  } else {
    // Login Failure
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

module.exports = router;