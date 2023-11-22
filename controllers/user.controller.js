const User = require('../database/models/user.model')
const { comparePassword, generateToken } = require('../js-files/server.helper')
const io = require('../js-files/socket.server')

const signup = (req,res) =>{
    const {email,password} = req.body
    User.create({email,password})
        .then(()=>{
            res.status(201).send({
                message: 'Registration successful'
            })
        })
        .catch((err)=>{
            if (err.code === 11000){
                return res.status(406).send({
                    message: 'Used email, choose another one'
                })
            }
            res.status(409).send(err)
        })
}

const login = async (req,res) =>{
    try{
        const {email,password} = req.body
        const user = await User.findOne({email})
        if(! user){
            return res.status(404).send({
                message: `user with email ${email} not found`
            })
        }
        const equaled = await comparePassword(password,user.password)
        if(! equaled){
            return res.status(401).send({
                message: `wrong password`
            })
        }
        const payload = {id:user._id, email}
        const token = await generateToken(payload)
        // res.cookie('token',token)
        // res.setHeader('Set-Cookie',`token=${token}; Secure`)
        req.session.token = token
        res.status(200).send({
            message: "Successfully logged in",
        });
        //socket: update user to online status and update online list
        user.online = true
        await user.save()
        // const socket = req.app.get("socket");
        // socket.emit('addToOnlineList', email);
        io.getIO().emit('addToOnlineList', email);
    }catch(err){
        res.status(500).send(err)
    }
}

const logout = async (req,res) =>{
    try{
        const {email} = req.user
        // res.clearCookie('token')
        req.session.destroy()
        //socket: update user to offline status and update online list
        await User.updateOne({email},{online:false})
        // const socket = req.app.get("socket");
        // socket.emit('removeFromOnlineList', email);
        io.getIO().emit('removeFromOnlineList', email)
        res.status(200).send()
    }catch(err){
        res.status(500).send({
            message: 'internal error occured'
        })
    }
}

module.exports = {
    signup,
    login,
    logout
}