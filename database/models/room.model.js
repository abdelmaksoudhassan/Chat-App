const mongoose = require('mongoose');
const validator = require('validator').default
const {hash,genSalt} = require('bcryptjs')
const Message = require('./message.model')

const Schema = mongoose.Schema; 

const rounds = parseInt(process.env.ROUNDS)

const roomSchema = new Schema({ 
    code: {
        type: String,
        required: [true,'code field is required'],
        unique: true,
        length: [4,`code field must be 4 digits`],
        validate:{
            validator:(value)=>{
                return validator.isNumeric(value) 
            },
            message: 'invalid code'
        }
    }, 
    password: {
        type: String,
        required: [true,'password field is required']
    },
    admin: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    messages: [
        { type: Schema.Types.ObjectId, ref: 'Message' }
    ]
});

roomSchema.pre('save',async function(next){
    if (this.isModified('password')) {
        const salt = await genSalt(rounds)
        const hashedPassword = await hash(this.password,salt)
        this.password = hashedPassword
    }
    next()
})
roomSchema.pre('deleteOne', { document: false, query: true }, async function() {
    const doc = await this.model.findOne(this.getFilter());
    await Message.deleteMany({ room: doc._id });
    next()
  });

const Room = mongoose.model('Room', roomSchema)

module.exports = Room