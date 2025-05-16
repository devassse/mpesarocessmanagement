
const express = require('express');
const { login, signup } = require('../controllers/user');
const authMiddleware = require('../middleware/auth_middleware');

const userRouter = express.Router();


userRouter.post("/sign", login)
userRouter.post("/signup", signup)
userRouter.get('/current-user', authMiddleware, (req, res) => {
    res.json(req.user);
  });

module.exports = userRouter;