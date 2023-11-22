const express = require('express')
const userController = require('../controllers/user.controller')
const authGuard = require('../guards/auth.guard')

const userRouter = express.Router()

userRouter.post('/signup',userController.signup)
userRouter.post('/login',userController.login)
userRouter.post('/logout',authGuard,userController.logout)

module.exports = userRouter