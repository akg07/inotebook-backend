const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');



// Get all the notes : GET "api/notes/fetch-all-notes"
router.get('/fetch-all-notes', fetchuser, async (req, res) => {
  try{
    const notes = await Notes.find({user: req.user.id}).sort({_id: -1});
    res.json(notes);
  }catch(error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// Add a new notes using post : GET "api/notes/add-note" : Login required
router.post('/add-note', fetchuser, [
  body('title', 'Enter a valid Title').isLength({min: 3}),
  body('description', 'Enter a valid description').isLength({min: 5})
], async (req, res) => {
  try{
    //  If error comes return it
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array() });
    }

    const {title, description, tag} = req.body;

    const note = new Notes({
      title, description, tag, user:req.user.id
    });

    const saveNote = await note.save();

    res.status(200).send({data:saveNote, message: "Note created successfully"});
  }catch(error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// Update a notes using post : GET "api/notes/update-note" : Login required
router.post('/update-note/:id', fetchuser, async (req, res) => {
  try{
    const {title, description, tag} = req.body;

    // CREATE A NEW NOTE OBJECT
    const newNote = {};
    if(title) {newNote.title = title};
    if(description) {newNote.description = description};
    if(tag) {newNote.tag = tag};

    // Find the note to be updated and update it
    let note = await Notes.findById(req.params.id);
    if(!note) {
      res.status(404).send("Note Not Found");
    }

    if(note.user.toString() !== req.user.id) {
      res.status(401).send("Unauthorized Note access");
    }

    note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true});
    res.send({updatedNote: note, message: "Notes Updated Successfully"});
    
  }catch(error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// Delete a notes using post : GET "api/notes/delete-note" : Login required
router.post('/delete-note/:id', fetchuser, async (req, res) => {
  try{
    // Find the note to be updated and delete it
    let note = await Notes.findById(req.params.id);
    if(!note) {
      res.status(404).send("Note Not Found");
    }

    if(note.user.toString() !== req.user.id) {
      res.status(401).send("Unauthorized Note access");
    }

    note = await Notes.findByIdAndDelete(req.params.id)
    res.send({message: "Notes deleted Successfully"});
    
  }catch(error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

module.exports = router;