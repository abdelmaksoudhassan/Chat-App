const mongoose = require('mongoose');
const validator = require('validator').default
const {hash,genSalt} = require('bcryptjs')
const Schema = mongoose.Schema; 

const rounds = parseInt(process.env.ROUNDS)

const userSchema = new Schema({ 
    email: {
        type: String,
        required: [true,'email field is required'],
        unique: true,
        validate:{
            validator:(value)=>{
                return validator.isEmail(value) 
            },
            message: 'invalid email form'
        }
    }, 
    password: {
        type: String,
        required: [true,'password field is required']
    }, 
    online:{
        type:Boolean,
        default: false
    }
}); 

// userSchema.virtual('rooms',{
//     ref:'Room',
//     localField:'_id',
//     foreignField:'admin'
// })

userSchema.pre('save',async function(next){
    if (this.isModified('password')) {
        const salt = await genSalt(rounds)
        const hashedPassword = await hash(this.password,salt)
        this.password = hashedPassword
    }
    next()
})

// userSchema.post('save', function(error, doc, next) {
//     if (error.code === 11000) {
//       next(new Error('used email, choose another one'));
//     } else {
//       next(error);
//     }
//   });

const User = mongoose.model('User', userSchema)

module.exports = User