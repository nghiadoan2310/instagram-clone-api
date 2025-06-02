import * as path from "path"
import { promisify } from "util"
import bcrypt from 'bcryptjs'
import { Op } from "sequelize"

import db from '../models'
import * as initRedis from '../config/redis'
import nodemailerInit from "../config/nodemailer"

const {
    instanceConnect: clientRedis
} = initRedis.getRedis()

const setAsync = promisify(clientRedis.set).bind(clientRedis)
const getAsync = promisify(clientRedis.get).bind(clientRedis)

const salt = bcrypt.genSaltSync(10)

const hashUserPassword = (password) => {
    //Mã hoá password
    return bcrypt.hashSync(`${password}`, salt)
}

const checkPassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword)
}

const checkEmailExists = async (userEmail) => {
    //Kiểm tra email đã tồn tại chưa
    const user = await db.User.findOne({
        where: {email: userEmail}
    })
    
    if(user) {
        return true
    }

    return false
}

const checkPhoneExists = async (userPhone) => {
    //Kiểm tra email đã tồn tại chưa
    const user = await db.User.findOne({
        where: {phone: userPhone}
    })
    
    if(user) {
        return true
    }

    return false
}

const handleLogin = async (account, password) => {
    try {
        const user = await db.User.findOne({
            where: {
                [Op.or]: [
                    { email: account },
                    { phone: account },
                ]
            },
        })

        if(!user) {
            return {
                EM: "Account or password incorrect",
                EC: 1,
                DT: {}
            }
        }

        const isValidPassword = checkPassword(password, user.password)

        if(!isValidPassword) {
            return {
                EM: "Account or password incorrect",
                EC: 1,
                DT: {}
            }
        }

        return {
            EM: "Login successful",
            EC: 0,
            DT: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                username: user.userName,
            },
        }

    } catch (error) {
        console.error(error);
        return {
            EM: "Internal server error",
            EC: -1,
            DT: {}
        }
    }
}

const handleSignupEmail = async (email) => {
    try {
        const OTP = (Math.floor(Math.random() * 1000000) + 1000000).toString().slice(1)
        const __dirname = path.resolve();
        const filePath = path.join(__dirname, '/src/templates/authEmail.html');
        const subjectEmail = `${OTP} là mã Instagram của bạn`

        //lưu tạm thông tin đăng ký vào redis
        await clientRedis.set(
            `register:${email}`, JSON.stringify({ OTP, isVerified: false, expiresAt: Date.now() + 300000 }),
            'EX', 300
        )

        nodemailerInit(filePath, email, subjectEmail, OTP)

    } catch (error) {
        console.error(error);  
    }
}

const confirmOTP = async (email, OTP) => {
    try {
        const data = await getAsync(`register:${email}`)
        // const data =  await clientRedis.get(`register:${email}`, (err, result) => {
        //     if(err) {
        //         console.error(err)
        //     } else if(result) {
        //         dataParsed = JSON.parse(result)
        //     }
        // })

        const dataParsed = JSON.parse(data)

        if(!dataParsed) {
            console.log('hehe')
            return {
                EM: "OTP expired or not exist",
                EC: 1,
                DT: ''
            }
        }
    
        const OTPSaved = dataParsed.OTP
        const expiresAt = dataParsed.expiresAt

        if(Date.now() > expiresAt) {
            return {
                EM: "OTP expired",
                EC: 1,
                DT: ''
            }
        }
    
        if(OTP !== OTPSaved) {
            return {
                EM: "Invalid_OTP",
                EC: 1,
                DT: ''
            }
        }
    
        await clientRedis.set(
            `register:${email}`, JSON.stringify({ OTP, isVerified: true, expiresAt }),
            'EX', 300
        )
    
        return {
            EM: "Confirm OTP code successful",
            EC: 0,
            DT: ''
        }

    } catch (error) {
        console.error(error)
        return {
            EM: 'Internal server error',
            EC: -1,
            DT: {}
        }
    }
}

const handleSignup = async (userData) => {
    try {
        if(userData.email) {
            if(await checkEmailExists(userData.email)) {
                return {
                    EM: "Email already exists",
                    EC: -1,
                    DT: ''
                }
            }
        }
        
        if(userData.phone) {
            if(await checkPhoneExists(userData.phone)) {
                return {
                    EM: "Phone already exists",
                    EC: -1,
                    DT: ''
                }
            }
        }

        const hashedPassword = hashUserPassword(userData.password)

        await db.User.create({
            email: userData.email ?? '',
            phone: userData.phone ?? '',
            password: hashedPassword,
            fullName: userData.fullname,
            userName: userData.username,
            birthday: userData.birthday
        })

        return {
            EM: "Signup successful",
            EC: 0,
            DT: ''
        }
        
    } catch (error) {
        console.error(error)
        return {
            EM: 'Internal server error',
            EC: -1,
            DT: {}
        }
    }
}

module.exports = {
    handleLogin,
    handleSignupEmail,
    confirmOTP,
    handleSignup
}