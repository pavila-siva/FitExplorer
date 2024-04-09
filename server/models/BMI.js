// BMI.js (model)
const mongoose = require('mongoose');

const BMISchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Fitness' },
  height: Number,
  weight: Number,
  BMIvalue: Number
},
{timestamps: true});

const BMIModel = mongoose.model('BMI', BMISchema);

module.exports = BMIModel;