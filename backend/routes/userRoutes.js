const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 🔐 REGISTER USER
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 4) {
      return res.status(400).json({ message: "Password must be at least 4 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({ email: email.toLowerCase(), password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User Registered Successfully" });

  } catch (err) {
    console.log("REGISTER ERROR:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});


// 🔐 LOGIN USER
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "User not found. Please register first." });
    }

    // Check password with bcrypt
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, email: user.email });

  } catch (err) {
    console.log("LOGIN ERROR:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;