const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');


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


module.exports = router;