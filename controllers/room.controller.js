const Room = require('../database/models/room.model')
const { comparePassword, generateToken } = require('../js-files/server.helper')

const addRoom = (req,res,next) =>{
    const {code,password} = req.body
    const admin = req.user.id
    Room.create({code,password,admin})
        .then(()=>{
            res.status(201).send({
                message: `Room with code ${code} created`
            })
            next()
        })
        .catch((err)=>{
            if (err.code === 11000){
                return res.status(406).send({
                    message: 'Duplicated code, choose another one'
                })
            }
            res.status(409).send(err)
        })
}

const deleteRoom = async (req,res,next) =>{
    try{
        const code = req.params.code
        const admin = req.user.id
        await Room.deleteOne({code,admin})
        res.status(200).send({
            message: `room with code ${code} deleted`
        })
        next()
    }catch(err){
        console.log(err)
        res.status(500).send(err)
    }
}

const joinRoom = async (req,res,next) =>{
    const {id,email} = req.user
    try{
        const {code,password} = req.body
        const room = await Room.findOne({code})
        if(! room){
            return res.status(404).send({
                message: `Room with code ${code} not found`
            })
        }
        const equaled = await comparePassword(password,room.password)
        if(! equaled){
            return res.status(401).send({
                message: `wrong room password`
            })
        }
        const payload = {id,roomId:room.id,code,email}
        const token = await generateToken(payload)
        req.session.roomToken = token
        res.status(200).send();
        next()
    }catch(err){
        res.status(500).send(err)
    }
}
const enterRoom = async (req,res,next) =>{
    const code = req.params.code
    try{
        const {id,email} = req.user
        const room = await Room.findOne({code})
        if(! room){
            return res.status(404).send({
                message: `Room with code ${code} not found`
            })
        }
        if(room.admin != id){
            return res.status(401).send({
                message: `unauthorized, join with password`
            })
        }
        const payload = {id,roomId:room.id,code,email}
        const token = await generateToken(payload)
        req.session.roomToken = token
        res.status(200).send();
        next()
    }catch(err){
        res.status(500).send(err)
    }
}

const myRooms = (req,res,next) =>{
    const admin = req.user.id
    Room.find({admin}).then(docs=>{
        res.status(200).send(docs)
        next()
    }).catch(err=>{
        res.status(500).send(err)
    })
}

module.exports = {
    addRoom,
    deleteRoom,
    joinRoom,
    enterRoom,
    myRooms
}