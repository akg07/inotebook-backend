const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotesSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tag: { type: String, default: "General" },
  timestamp: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
});

module.exports = mongoose.model("notes", NotesSchema);
