const bcrypt = require("bcrypt"); // corrected
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Update path to your User model
const authMiddleware = require("../middleware/authmid"); // corrected
let client = null;
try {
  const { OAuth2Client } = require("google-auth-library");
  if (process.env.GOOGLE_CLIENT_ID) {
    client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
} catch (e) {
  // google-auth-library not installed or configured yet
}

const express = require('express');
const router = express.Router();

// POST /signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (✅ fixed line)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ token, user: { id: newUser._id, name, email } });
  } catch (err) {
      console.error("SignUp Error",err)
    res.status(500).json({ msg: "Server error" });
  }
});


// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});


// Login Via Google
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body; // frontend sends Google token

    if (!client) {
      return res.status(501).json({ msg: "Google OAuth is not configured on the server." });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload; // sub = Google userId

    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,  // store Google’s ID
        password: null, // no password since it’s Google login
      });
    }

    // Generate JWT for our app
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Google login error", err);
    res.status(500).json({ msg: "Server error" });
  }
});
 
module.exports = router;
