const mongoose = require('mongoose');

const Schema = mongoose.Schema; 

const messageSchema = new Schema({ 
    text: {
        type: String,
        required: [true,'text field is required'],
        length: [1,`text field must be at least 1 digit`],
    },
    sender: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    room: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }
});

const Message = mongoose.model('Message', messageSchema)

module.exports = Message