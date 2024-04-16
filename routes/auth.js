const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');


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
    res.status(500).send("Internal server error");
  }
  
});

// Authenticate a User "/api/auth/login". Login Required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res)=>{
  
  //  If error comes return it
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array() });
  }

  const {email, password} = req.body;
  
  try{
    let user = await User.findOne({email});

    if(!user) {
      return res.status(400).json({error: "Incorrect email/password"});
    }

    const passwordCompare = await bcrypt.compare(password, user.password);

    if(!passwordCompare) {
      return res.status(400).json({error: "Incorrect email/password"});
    }

    const data = {
      user : {
        id: user._id
      }
    }

    const authToken = jwt.sign(data, JWT_SECERT);

    res.send({authToken, message: "Login successfully"});

  }catch(error) {
    console.error(ex.message);
    res.status(500).send("Internal server error");
  }
});

// Get loggedin user details : POST "api/auth/getUser". Login Required
router.get('/getUser', fetchuser, async (req, res) => {
  try{
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    // console.log(user);

    res.status(200).send(user);
  }catch(error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

module.exports = router;