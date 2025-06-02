import * as authService from "../service/authService"
import { signAccessToken, signRefreshToken } from "../middleware/jwt_service";

const handleLogin = async (req, res) => {
    try {

        console.log(req.body)
        if(!req.body.account) {
            return res.status(400).json({
                EM: "Account empty",
                EC: "1",
                DT: [],
            });
        }

        if(!req.body.password) {
            return res.status(400).json({
                EM: "Password empty",
                EC: "1",
                DT: [],
            });
        }

        const data = await authService.handleLogin(req.body.account, req.body.password)

        if (data && data.EC === 0) {
            const access_token = await signAccessToken(data.DT.id)
            const refresh_token = await signRefreshToken(data.DT.id)

            res.cookie('access_token', access_token, {
                maxAge: 60 * 60 * 1000,
                httpOnly: true
            })

            res.cookie('refresh_token', refresh_token, {
                maxAge:  7 * 24 * 60 * 60 * 1000,
                httpOnly: true
            })

            return res.status(200).json({
                EM: data.EM,
                EC: data.EC,
                DT: data.DT
            })
        }

        return res.status(400).json({
            EM: data.EM,
            EC: data.EC,
            DT: [],
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EM: "error from server",
            EC: "-1",
            DT: [],
        });
    }
}

const handleSignupEmail = async (req, res) => {
    try {
        if(!req.body.email) {
            return res.status(400).json({
                EM: "Email empty",
                EC: "1",
                DT: [],
            });
        }

        await authService.handleSignupEmail(req.body.email)

        return res.status(200).json({
            EM: "Signup successful",
            EC: 0,
            DT: ''
        })
    } catch (error) {
        console.error(error);   
    }
}

const confirmOTP = async (req, res) => {
    try {
        const {email, OTP} = req.body

        const data = await authService.confirmOTP(email, OTP)

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EM: "error from server",
            EC: "-1",
            DT: [],
        });
    }
}

const handleSignup = async (req, res) => {
    try {
        if(!req.body.email && !req.body.phone) {
            return res.status(400).json({
                EM: "Missing required fields",
                EC: "1",
                DT: [],
              });
        }

        if(!req.body.password) {
            return res.status(400).json({
                EM: "Missing required fields",
                EC: "1",
                DT: [],
            });
        }

        const data = await authService.handleSignup(req.body)

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        })
    } catch (error) {
        return res.status(500).json({
            EM: "error from server",
            EC: "-1",
            DT: [],
        });
    }
}

const handleRefreshToken = (req, res) => {
    try {
        const refreshToken = req.cookie.refreshToken
    } catch (error) {
        
    }
}

export const authController = {
    handleLogin,
    handleSignupEmail,
    confirmOTP,
    handleSignup,
    handleRefreshToken,
}