const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const mongoose = require('mongoose');

const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");
const aiRoutes = require("./routes/ai");

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration - supports localhost and production frontends
app.use(
  cors({
    origin: true, // Reflects the request origin, allowing local dev and deployed frontend
    credentials: true,
  })
);

app.use(express.json());

// Rate Limiter: 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: "Too many requests from this IP, please try again later." },
});
app.use("/api", limiter);

// Stricter rate limit for AI operations to prevent quota exhaustion
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { msg: "AI rate limit reached. Please wait a minute." },
});
app.use("/api/ai", aiLimiter);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Health check / welcome route
app.get('/api/message', (req, res) => {
  res.json({ message: 'Backend is connected and running smoothly 🎉' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/ai', aiRoutes);

// Global Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ msg: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
