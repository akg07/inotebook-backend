const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const JWT_SECERT = 'myjwtauthtokenkey';

// create a user using : POST "/api/auth/"; Doesn't require Authentication
router.post('/create-user', [
  body('name', 'Enter a valid Name').isLength({min: 3}),
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'Password should be greater than 5 character').isLength({min: 5}),
] , async (req, res) => {
  try{
    //  If error comes return it
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array() });
    }

    // check weather user with email exists.
    let user = await User.findOne({email: req.body.email});
    if(user) {
        return res.status(400).json({error: "User with emailId already exists"});
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // create new user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass
    });

    const data = {
      user : {
        id: user._id
      }
    }

    const authToken = jwt.sign(data, JWT_SECERT);

    res.send({authToken, message: "User created successfully"})
  }catch(ex) {
    console.error(ex.message);
    res.status(500).send("some error occured.");
  }
  
});


module.exports = router;