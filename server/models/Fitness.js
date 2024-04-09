const mongoose = require('mongoose')

const FitnessSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const FitnessModel = mongoose.model("Fitness", FitnessSchema)
module.exports = FitnessModel