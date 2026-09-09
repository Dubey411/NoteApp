const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "blue",
  },
  tags: [String],
  starred: {
    type: Boolean,
    default: false,
  },
  archived: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: "StickyNote",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Note", noteSchema);
