const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchUser = require('../middleware/fetchUser');

// Route 1: Fetch all notes of logged-in user
router.get('/fetchallnotes', fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route 2: Add a new note
router.post('/addnote', fetchUser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    const note = new Notes({
      title,
      description,
      tag,
      user: req.user.id
    });

    const savedNote = await note.save();
    res.json(savedNote);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route 3: Update an existing note
router.put('/updatenote/:id', fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    // Create a new note object
    const newNote = {};
    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;

    // Find the note to be updated
    let note = await Notes.findById(req.params.id);
    if (!note) return res.status(404).send("Not Found");

    // Allow update only if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );

    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route 4: Delete a note
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
  try {
    let note = await Notes.findById(req.params.id);
    if (!note) return res.status(404).send("Not Found");

    // Allow delete only if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
