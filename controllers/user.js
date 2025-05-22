const User = require('../models/user'); // Adjust the path as needed
const jwt = require('jsonwebtoken')
const logUserAction = require("../controllers/generic_functions/user_logs")
const bcrypt = require('bcrypt');

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3h' })
}

// login a user
const login = async (req, res) => {
  const { email, password } = req.body;
  const isLocal = process.env.LOCAL;
  let user = null

  console.log("Is Local", isLocal);
  

  try {
    if(isLocal){
      user = await User.loginLocal(email, password);
    }else{
      user = await User.login(email, password);
    }

    let userID = user._id || user.data._id.toString()

    // Create a token
    const token = createToken(userID);
    
    // Log user action
    // logUserAction(user._id, "User Auth", `login from ${req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress}`);

    res.status(200).json({
      email,
      token,
      id: userID,
      roles: user.roles || user.data.roles,
    });

  } catch (error) {
    console.log(error.message);
    res.status(404).json({ error: error.message });
  }
};

// signup a user
const signup = async (req, res) => {
  const { email, username, password, department, ticketId } = req.body;
  let user = null
  const isLocal = process.env.LOCAL;
  
  try {
    if(isLocal){
      user = await User.signupLocal(email, username, password, department, ticketId);
    }else{
      user = await User.signup(email, username, department, ticketId);
    }

    console.log("User found Local: ", user);

    res.status(201).json({
      message: 'User registered successfully. Please wait for account activation or contact support.',
      user: {
        email: user.email,
        username: user.username,
        department: user.department,
        status: user.status
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { signup, login }
