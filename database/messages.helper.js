const Message = require('./models/message.model')
const Room = require('./models/room.model')

const saveMessage = async (id,roomId,text) => {
    const msg = new Message({
        text,
        sender: id,
        room: roomId
    })
    await msg.save()
    const room = await Room.findById(roomId)
    room.messages.push(msg)
    await room.save()
}

const getRoomData = async (code) =>{
    const roomData = await Room.findOne({code})
    .populate('admin','email')
    .populate({
        path:'messages',select:['text','sender'],
        populate:{path:'sender',select:'email'}
    })
    .exec()
    return roomData
}

module.exports = {
    saveMessage,
    getRoomData
}