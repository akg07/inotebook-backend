const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/inotebook";

mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error.'));

db.once('open', ()=> {
  console.log('Connected to inotebook MongoDB successfully.');
});

module.exports = db;