import express from 'express';
import { authController } from '../../controller/authController';

// import * as authController from '../../controller/authController';

const routes = express.Router();

routes.post('/login', authController.handleLogin);
routes.post('/signup', authController.handleSignup);
routes.post('/signup/email', authController.handleSignupEmail);
routes.post('/signup/confirm-otp', authController.confirmOTP);
routes.post('/refresh-token', authController.handleRefreshToken);


module.exports = routes;