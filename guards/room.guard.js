const { verifyToken } = require('../js-files/server.helper')

const authGuard = async (request,response,next) => {
    try{
        const token = request.session.roomToken
        if(! token){
            return response.render('error',{
                code: 403,
                message: 'no room token, you need to join first'
            })
        }
        const data = await verifyToken(token)
        if(! data){
            return response.render('error',{
                code: 403,
                message: 'expired or incorrect token, you need to rejoin'
            })
        }
        request.data = data
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