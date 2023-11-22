const { verifyToken } = require('../js-files/server.helper')

const authGuard = async (request,response,next) => {
    try{
        // const token = request.cookies.token
        const token = request.session.token
        if(! token){
            return response.render('error',{
                code: 401,
                message: 'no auth token, you need to login'
            })
        }
        const user = await verifyToken(token)
        if(! user){
            return response.render('error',{
                code: 401,
                message: 'expired or incorrect auth token, you need to login'
            })
        }
        request.user = user
        next()
    }
    catch(err){
        response.render('error',{
            code: 500,
            message: 'internal server error'
        })
    }
}

module.exports = authGuard