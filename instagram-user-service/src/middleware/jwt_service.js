import jwt from 'jsonwebtoken'

const signAccessToken = async (data) => {
    return new Promise((resolve, reject) => {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        const payload = {
            ...data
        }

        jwt.sign(payload, secret, (err, token) => {
            if (err) {
                reject(err)
            } else {
                resolve(token)
            }
        })
    })
}

const signRefreshToken = async (data) => {
    return new Promise((resolve, reject) => {
        const secret = process.env.REFRESH_TOKEN_SECRET;
        const payload = {
            ...data
        }

        jwt.sign(payload, secret, (err, token) => {
            if (err) {
                reject(err)
            } else {
                resolve(token)
            }
        })
    })
}

const verifyToken = async (req, res, next) => {
    try {        
        const cookies = req.cookies
        const access_token = cookies.access_token
    
        const payload = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)
        req.user = payload
        next()
    } catch (err) {
        if(err.message === 'TokenExpiredError') {
            return res.json({
                EM: 'Token expired',
                EC: 401,
            })
        }

        return res.json({
            EM: 'Invalid token',
            EC: 500,
        })
    }
}

export {
    signAccessToken,
    signRefreshToken,
    verifyToken,
}