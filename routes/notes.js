const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');



// Get all the notes : GET "api/notes/fetch-all-notes"
router.get('/fetch-all-notes', fetchuser, async (req, res) => {
  try{
    const notes = await Notes.find({user: req.user.id});
    res.json(notes);
  }catch(error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// Add a new notes using post : GET "api/notes/fetch-all-notes" : Login required
router.post('/add-note', fetchuser, [
  body('title', 'Enter a valid Title').isLength({min: 3}),
  body('description', 'Enter a valid description').isLength({min: 5}),
  body('title'),

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


module.exports = router;