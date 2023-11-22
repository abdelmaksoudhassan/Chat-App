const express = require('express')
const app = require('express')()
// const socketIO = require('socket.io')
const socketIO = require('./js-files/socket.server')
const server = require('http').createServer(app)
const hbs = require('hbs')
const bodyParser = require('body-parser')
// const cookieParser = require("cookie-parser");
const session = require('express-session')
const ConnectMongodbSession = require('connect-mongodb-session')(session)
const { join } = require('path')
const userRouter = require('./routers/user.router')
const roomRouter = require('./routers/room.router')
const messagesHelper = require('./database/messages.helper')
const authGuard = require('./guards/auth.guard')
const roomGuard = require('./guards/room.guard')
const User = require('./database/models/user.model')

require('./database/connection')
require('dotenv').config({ path: './config/vars.env'})

const mainPath = join(__dirname,join('views','main'))
const partialsPath = join(__dirname,join('views','partials'))
// const IO = socketIO(server);
const IO = socketIO.init(server);
const store = ConnectMongodbSession({
    uri: process.env.DATABASE_URL,
    collection: 'sessions'
})

app.set('view engine','hbs')
app.set('views',mainPath)
// app.set('socketio', IO);
app.use(express.static(__dirname)) //CSS & JS Files
hbs.registerPartials(partialsPath)
hbs.registerHelper('isEqual',(x,y)=>{
    return x == y
})
app.use(bodyParser.json())
// app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETKEY,
    saveUninitialized: false,
    // cookie: {maxAge: 1000*60*60},
    resave: false,
    store: store
}))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(userRouter, roomRouter)

app.get('/',(req,res)=>{
    res.render('home')
})
app.get('/signup',(req,res)=>{
    res.render('signup')
})
app.get('/login',(req,res)=>{
    res.render('login')
})
app.get('/profile',authGuard,(req,res)=>{
    const {_id,email} = req.user
    User.find({online: true,email: {$ne : email}}).then(docs=>{
        const onlineList = docs.map(doc=>doc.email)
        res.render('profile',{_id,email,onlineList})
    }).catch(err=>{
        res.render('profile',{_id,email,onlineList:[]})
    })
})
app.get('/room',roomGuard,(req,res)=>{
    const queryCode = parseInt(req.query['code'])
    const guardCode = parseInt(req.data.code)
    if(queryCode != guardCode){
        return res.redirect('/profile')
    }
    const {id,email,roomId} = req.data
    res.render('room',{id,roomId,guardCode,email})
})
app.get('*',(req,res)=>{
    res.render('error.hbs',{
        code: 400,
        message: "invalid URL"
    })
})

IO.on('connection',(socket)=>{
    const {id} = socket
    console.log(`Server: socket ID ${id} connected`)

    socket.on('join', async(data, callback) => {
        var code
        var email
        if(data){
            code = data.code
            email = data.email
        }
        if(!code){
            return callback('waiting code to join room')
        }
        await socket.join(code);

        const roomData = await messagesHelper.getRoomData(code)

        socket.emit('loadRoomData',roomData)

        socket.emit('newMessage', {
            sender: "Automatic",
            body: `Welcome to room ${code}`
        });

        socket.broadcast.to(code).emit('newMessage', {
            sender: "Automatic",
            body: `${email} has joined`
        });

        app.set('socket',socket)
        callback();
    })

    socket.on('leave',async (param,callback)=>{
        socket.broadcast.to(param.code).emit('newMessage', {
            sender: "Automatic",
            body: `${param.email} has left`
        });
        callback()
    })

    socket.on('sendMessage',(params,callback)=>{
        const{id,roomId,code,email,txt} = params
        messagesHelper.saveMessage(id,roomId,txt).then(res=>{
            IO.to(code).emit('newMessage', {
                sender: email,
                body: txt
            });
            callback()
        }).catch(err=>{
            socket.emit('sendMsgErr',err)
        })
    })
    
    socket.on('disconnect', (msg)=>{
        console.log(`Back: socket ID ${id} ${msg}`)
    })
})

const port = process.env.PORT
server.listen(port,()=>{
    console.log(`Server Up On Port ${port}`)
})