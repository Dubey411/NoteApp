const express = require("express");
const crypto = require("crypto");
const Note = require("../models/note");
const authMiddleware = require("../middleware/authmid");

const router = express.Router();

/**
 * @route   GET /api/notes/public/:shareId
 * @desc    Public read-only route to view a shared note
 * @access  Public (No auth needed)
 */
router.get("/public/:shareId", async (req, res) => {
  try {
    const note = await Note.findOne({
      shareId: req.params.shareId,
      isPublic: true,
      isTrash: { $ne: true },
    }).select("-userId");

    if (!note) {
      return res.status(404).json({ msg: "Shared note not found or link is private" });
    }

    res.json(note);
  } catch (err) {
    console.error("Error fetching public note:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   POST /api/notes
 * @desc    Create a new note
 * @access  Private
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, color, tags, starred, archived, pinned, icon, aiSummary } = req.body;

    if (!title || !content) {
      return res.status(400).json({ msg: "Title and content are required" });
    }

    const newNote = new Note({
      title,
      content,
      color: color || "blue",
      tags: tags || [],
      starred: Boolean(starred),
      pinned: Boolean(pinned),
      archived: Boolean(archived),
      isTrash: false,
      isPublic: false,
      aiSummary: aiSummary || "",
      icon: icon || "StickyNote",
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
 * @desc    Get all active notes of logged-in user (excludes trash)
 * @access  Private
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user.id,
      isTrash: { $ne: true },
    }).sort({ pinned: -1, updatedAt: -1 });

    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   GET /api/notes/trash
 * @desc    Get all trashed notes of logged-in user
 * @access  Private
 */
router.get("/trash", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user.id,
      isTrash: true,
    }).sort({ updatedAt: -1 });

    res.json(notes);
  } catch (err) {
    console.error("Error fetching trash notes:", err);
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
    const { title, content, color, tags, starred, archived, pinned, icon, aiSummary } = req.body;

    let note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ msg: "Note not found" });

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (color !== undefined) note.color = color;
    if (tags !== undefined) note.tags = tags;
    if (starred !== undefined) note.starred = starred;
    if (archived !== undefined) note.archived = archived;
    if (pinned !== undefined) note.pinned = pinned;
    if (icon !== undefined) note.icon = icon;
    if (aiSummary !== undefined) note.aiSummary = aiSummary;
    note.updatedAt = Date.now();

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   PUT /api/notes/:id/trash
 * @desc    Soft-delete a note to trash or restore it
 * @access  Private
 */
router.put("/:id/trash", authMiddleware, async (req, res) => {
  try {
    let note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ msg: "Note not found" });

    // Toggle or use explicit value
    const toTrash = req.body.isTrash !== undefined ? req.body.isTrash : !note.isTrash;
    note.isTrash = toTrash;
    note.updatedAt = Date.now();

    const updatedNote = await note.save();
    res.json({
      msg: toTrash ? "Note moved to trash" : "Note restored from trash",
      note: updatedNote,
    });
  } catch (err) {
    console.error("Error trashing note:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   PUT /api/notes/:id/pin
 * @desc    Toggle pinned status of a note
 * @access  Private
 */
router.put("/:id/pin", authMiddleware, async (req, res) => {
  try {
    let note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ msg: "Note not found" });

    note.pinned = !note.pinned;
    note.updatedAt = Date.now();
    const updated = await note.save();
    res.json(updated);
  } catch (err) {
    console.error("Error pinning note:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   PUT /api/notes/:id/share
 * @desc    Toggle public sharing and generate shareable ID
 * @access  Private
 */
router.put("/:id/share", authMiddleware, async (req, res) => {
  try {
    let note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ msg: "Note not found" });

    note.isPublic = !note.isPublic;
    if (note.isPublic && !note.shareId) {
      note.shareId = crypto.randomUUID().slice(0, 10);
    }
    note.updatedAt = Date.now();

    const updatedNote = await note.save();
    res.json({
      isPublic: updatedNote.isPublic,
      shareId: updatedNote.shareId,
      note: updatedNote,
    });
  } catch (err) {
    console.error("Error toggling share:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   DELETE /api/notes/:id
 * @desc    Soft-delete note (move to trash)
 * @access  Private
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    let note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ msg: "Note not found" });

    note.isTrash = true;
    note.updatedAt = Date.now();
    await note.save();

    res.json({ msg: "Note moved to trash" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   DELETE /api/notes/:id/permanent
 * @desc    Permanently delete a note forever
 * @access  Private
 */
router.delete("/:id/permanent", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ msg: "Note not found" });
    res.json({ msg: "Note permanently deleted" });
  } catch (err) {
    console.error("Error permanently deleting note:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
