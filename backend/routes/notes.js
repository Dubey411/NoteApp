const express = require("express");
const Note = require("../models/note");
const authMiddleware = require("../middleware/authmid");

const router = express.Router();

/**
 * @route   POST /api/notes
 * @desc    Create a new note
 * @access  Private
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, color, tags, starred, archived, icon } = req.body;

    if (!title || !content) {
      return res.status(400).json({ msg: "Title and content are required" });
    }

    const newNote = new Note({
      title,
      content,
      color,
      tags,
      starred,
      archived,
      icon,
      userId: req.user.id,
    });

    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   GET /api/notes
 * @desc    Get all notes of logged-in user
 * @access  Private
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   GET /api/notes/:id
 * @desc    Get a single note by ID
 * @access  Private
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ msg: "Note not found" });
    res.json(note);
  } catch (err) {
    console.error("Error fetching note:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   PUT /api/notes/:id
 * @desc    Update a note
 * @access  Private
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content, color, tags, starred, archived, icon } = req.body;

    let note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ msg: "Note not found" });

    note.title = title || note.title;
    note.content = content || note.content;
    note.color = color || note.color;
    note.tags = tags || note.tags;
    note.starred = starred !== undefined ? starred : note.starred;
    note.archived = archived !== undefined ? archived : note.archived;
    note.icon = icon || note.icon;
    note.updatedAt = Date.now();

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete a note
 * @access  Private
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ msg: "Note not found" });
    res.json({ msg: "Note deleted successfully" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
