// Resistance.js

const mongoose = require('mongoose');

// Define the schema for resistance exercise data
const ResistanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Fitness' }, // Reference to the user who added the exercise
  name: String, // Exercise name
  weight: Number, // Weight in lbs
  sets: Number, // Number of sets
  reps: Number, // Number of reps
  date: { type: Date, default: Date.now } // Date of the exercise (default to current date)
});

// Create a Mongoose model using the schema
const ResistanceModel = mongoose.model('Resistance', ResistanceSchema);

module.exports = ResistanceModel;
