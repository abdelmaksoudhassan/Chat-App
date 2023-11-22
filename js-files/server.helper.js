const { compare } = require('bcryptjs')
const { sign, verify } = require('jsonwebtoken')
require('dotenv').config({ path: './config/vars.env'})

async function comparePassword(password,encrypted){
    const equaled = await compare(password,encrypted)
    return equaled
}

async function generateToken(payload){
    const secretKey = process.env.SECRETKEY
    const token = await sign(payload,secretKey,{expiresIn: '1h'})
    return token
}

function verifyToken(token){
    const secretKey = process.env.SECRETKEY
    const data = verify(token,secretKey)
    return data
}

module.exports = {
    comparePassword,
    generateToken,
    verifyToken
}