const Message = require('./models/message.model')
const Room = require('./models/room.model')

const saveMessage = async (id,roomId,text) => {
    const msg = new Message({
        text,
        sender: id,
        room: roomId
    })
    const room = await Room.findById(roomId)
    if(! room){
        throw new Error('room not found it may be deleted from owner side !!')
    }
    room.messages.push(msg)
    await room.save()
    return await msg.save()
}

const getRoomData = async (code) =>{
    const roomData = await Room.findOne({code})
    .populate('admin','email')
    .populate({
        path:'messages',select:['text','sender','createdAt'],
        populate:{path:'sender',select:'email'}
    })
    .exec()
    return roomData
}

module.exports = {
    saveMessage,
    getRoomData
}