// models/FormData.js

const mongoose = require('mongoose');

// Define the schema for form data
const FormDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Fitness' }, // Reference to the user who added the exercise
  name: String,
  distance: Number,
  duration: Number,
  date: Date
});

// Create and export the FormData model
const FormDataModel = mongoose.model('FormData', FormDataSchema);
module.exports = FormDataModel;
