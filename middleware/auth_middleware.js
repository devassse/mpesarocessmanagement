const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Adjust the path to your User model


const authMiddleware = async (req, res, next) => {
  // Get the token from the request body or URL parameters
  const token = req.body.authToken || req.query.authToken;
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET); // Use your JWT secret
    // Find the user by ID from the decoded token
    const user = await User.findById(decoded._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Assign the user to req.user
    req.user = user;
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired.' });
    }
    return res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
