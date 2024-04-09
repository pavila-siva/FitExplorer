const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const FitnessModel = require('./models/Fitness')
const FormDataModel = require('./models/FormData') // Import the FormData model
const ResistanceModel = require('./models/Resistance'); // Import the model for resistance
const BMIModel = require('./models/BMI');
const jwt = require('jsonwebtoken')
const authenticateToken = require('./util/authenticateToken'); // Import the middleware
const secretKey = 'Pavila_1407';
const app = express()
app.use(express.json())
app.use(cors())


//connection with mongo db
mongoose.connect("mongodb://127.0.0.1:27017/fitness");
// DELETE endpoint for deleting exercise data
// DELETE endpoint for deleting exercise data
app.delete('/exercise-data/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const exerciseId = req.params.id;

        // Check if the exercise entry belongs to the authenticated user in FormDataModel
        const formDataExercise = await FormDataModel.findOne({ _id: exerciseId, user: userId });
        if (formDataExercise) {
            await FormDataModel.deleteOne({ _id: exerciseId });
        }

        // Check if the exercise entry belongs to the authenticated user in ResistanceModel
        const resistanceExercise = await ResistanceModel.findOne({ _id: exerciseId, user: userId });
        if (resistanceExercise) {
            await ResistanceModel.deleteOne({ _id: exerciseId });
        }

        // If either of the models had the exercise entry and it's deleted successfully
        if (formDataExercise || resistanceExercise) {
            res.json({ message: 'Exercise deleted successfully' });
        } else {
            res.status(404).json({ message: 'Exercise not found or unauthorized access' });
        }
    } catch (error) {
        console.error('Failed to delete exercise:', error);
        res.status(500).json({ message: 'Failed to delete exercise', error: error.message });
    }
});


// Route to handle form submissions for adding exercises
// Update the routes for adding exercises to include the authenticated user's ID

// Route to handle BMI data submissions
// Route to handle BMI data submissions
app.post("/add-bmi", authenticateToken, async (req, res) => {
    try {
        const { height, weight, bmiValue } = req.body;
        const bmiData = new BMIModel({ height, weight, BMIvalue: bmiValue, user: req.user.id });
        await bmiData.save();
        res.status(201).json({ message: 'BMI data saved successfully' });
    } catch (error) {
        console.error('Failed to save BMI data:', error);
        res.status(500).json({ message: 'Failed to save BMI data', error: error.message });
    }
});


// Example for FormData
app.post("/add-exercise", authenticateToken, async (req, res) => {
    try {
        const formData = new FormDataModel({ ...req.body, user: req.user.id });
        await formData.save();
        res.status(201).json({ message: 'Form data saved successfully' });
    } catch (error) {
        console.error('Failed to save form data:', error);
        res.status(500).json({ message: 'Failed to save form data', error: error.message });
    }
});

// Route to handle form submissions for adding resistance exercises
// Example for ResistanceModel
app.post("/add-resistance", authenticateToken, async (req, res) => {
    try {
        const resistanceData = new ResistanceModel({ ...req.body, user: req.user.id });
        await resistanceData.save();
        res.status(201).json({ message: 'Resistance exercise data saved successfully' });
    } catch (error) {
        console.error('Failed to save resistance exercise data:', error);
        res.status(500).json({ message: 'Failed to save resistance exercise data', error: error.message });
    }
});



app.post("/login",(req, res)=>{
    const {email, password} = req.body;
    FitnessModel.findOne({email: email})
    .then(user =>{
        if(user){
            if(user.password === password){
                const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: "30d" });
                res.json({ token, message: "Success" }); // Respond
               

            }else {
                res.json("the password is incorrect")
            }
        }else {
            res.json("No record existed")
        }
    })
})

app.post('/signup', (req, res)=>{
    FitnessModel.create(req.body)
    .then(fitness => res.json(fitness))
    .catch(err => res.json(err))

})

app.get("/user", authenticateToken, (req, res) => {
    const userId = req.user.id;
    FitnessModel.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            // If user found, return user data
            res.json(user);
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});

// Update the route for fetching exercise data to retrieve exercises associated with the authenticated user

app.get('/exercise-data', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const cardioData = await FormDataModel.find({ user: userId });
        const resistanceData = await ResistanceModel.find({ user: userId });

        const formattedExerciseData = [];

        // Check if cardioData array is not empty
        if (cardioData.length > 0) {
            formattedExerciseData.push(...cardioData.map(exercise => ({ ...exercise.toObject(), type: 'cardio' })));
        }

        // Check if resistanceData array is not empty
        if (resistanceData.length > 0) {
            formattedExerciseData.push(...resistanceData.map(exercise => ({ ...exercise.toObject(), type: 'resistance' })));
        }

        const formattedExerciseDataWithISODate = formattedExerciseData.map(exercise => ({
            ...exercise,
            // date: exercise.date.toISOString()
        }));

        res.json(formattedExerciseDataWithISODate);
    } catch (error) {
        console.error('Failed to fetch exercise data:', error);
        res.status(500).json({ message: 'Failed to fetch exercise data', error: error.message });
    }
});


// Apply the authenticateToken middleware to your protected routes
app.get('/protected', authenticateToken, (req, res) => {
    // Only accessible with a valid token
    res.json({ message: 'Protected route accessed successfully.', user: req.user });
});

// Route to fetch user's weight and height data
app.get("/add-bmi", authenticateToken, (req, res) => {
    const userId = req.user.id;
    FitnessModel.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            
            // Find the latest BMI data for the authenticated user
            BMIModel.findOne({ user: userId }).sort({ 
                createdAt: -1 }) // Sort by date in descending order to get the latest entry
                .then(bmiData => {
                    res.json({
                        user: {
                            name: user.name,
                            // Add other user data here if needed
                        },
                        bmiData: bmiData ? {
                            height: bmiData.height,
                            weight: bmiData.weight,
                            BMIvalue: bmiData.BMIvalue
                        } : null
                    });
                })
                .catch(error => {
                    console.error("Error fetching BMI data:", error);
                    res.status(500).json({ message: "Internal server error" });
                });
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});





app.listen(3001, () => {
    console.log("server is running")
})
