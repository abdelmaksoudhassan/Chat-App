const express = require('express')
const roomController = require('../controllers/room.controller')
const authGuard = require('../guards/auth.guard')

const roomRouter = express.Router()

roomRouter.post('/add-room',authGuard,roomController.addRoom)
roomRouter.delete('/delete-room/:code',authGuard,roomController.deleteRoom)
roomRouter.post('/join-room',authGuard,roomController.joinRoom)
roomRouter.post('/enter-room/:code',authGuard,roomController.enterRoom)
roomRouter.get('/my-rooms',authGuard,roomController.myRooms)

module.exports = roomRouter