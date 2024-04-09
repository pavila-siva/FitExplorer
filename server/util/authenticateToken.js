// const jwt = require('jsonwebtoken');
// const secretKey = 'Pavila_1407'; // Replace with your secret key

// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['Authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if (token == null) return res.sendStatus(401);

//     jwt.verify(token, secretKey, (err, user) => {
//         if (err) return res.sendStatus(403);
//         req.user = user;
//         next();
//     });
// };

// module.exports = authenticateToken;
const jwt = require('jsonwebtoken');
const secretKey = 'Pavila_1407'; 
const Fitness = require('../models/Fitness'); // Import the User model

const authenticateToken = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
  
            // Decode the token and extract user id
            const decoded = jwt.verify(token, secretKey);
  
            // Find user by id and attach to request object
            req.user = await Fitness.findById(decoded.id).select("-password");
  
            // Check if user is found
            if (!req.user) {
                throw new Error("User not found");
            }

            next();
        } catch (error) {
            console.error(error.message);
            res.status(401).json({ error: "Not authorized, token failed" });
        }
    }
  
    if (!token) {
        res.status(401).json({ error: "Not authorized, no token" });
    }
};

module.exports = authenticateToken;
