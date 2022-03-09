import express from 'express';
import { createAccessJWT } from '../helpers/jwt.helper.js';

import {
    getUserByEmail,
    getUserByEmailAndRefreshToken,
} from '../models/user-model/User.model.js';

import { verifyRefreshJWT } from '../helpers/jwt.helper.js';
import { createUniqueOTP } from '../models/reset-pin/Pin.model.js';
import { sendPasswordResetOTP } from '../helpers/email.helper.js';

const Router = express.Router();
Router.all('/', (req, res, next) => {
    console.log('token got hit');
    next();
});

Router.get('/', async (req, res) => {
    try {
        const { authorization } = req.headers;
        // 1. check if the token is valid
        const { email } = verifyRefreshJWT(authorization);
        console.log(email);

        // 2. get the user info
        if (email) {
            // Get user ID from db by email
            const filter = {
                email,
                refreshJWT: authorization,
            };
            const user = await getUserByEmailAndRefreshToken(filter);
            if (user?._id) {
                const accessJWT = await createAccessJWT({
                    _id: user._id,
                    email,
                });
                console.log(accessJWT);
                return res.json({
                    accessJWT,
                });
            }
        }
        res.status(401).json({
            status: 'error',
            message: 'Unauthenticated',
        });
    } catch (error) {
        console.log(error);
        res.status(401).json({
            status: 'error',
            message: 'Unauthenticated!',
        });
    }
});

// request OTP for password reset
Router.post('/request-otp', async (req, res) => {
    try {
        // get email
        const { email } = req.body;
        // get user by email
        if (email) {
            const user = await getUserByEmail(email);
            if (user?._id) {
                // create an otp and store in token table along with user id
                const result = await createUniqueOTP({
                    email,
                    type: 'Password Reset OTP',
                });
                if (!result?._id) {
                    return res.json({
                        status: 'error',
                        message: 'Please try again later.',
                    });
                }
                // send email with the created otp
                const emailObj = { email, otp: result.otp, fname: user.fname };
                sendPasswordResetOTP(emailObj);
            }
        }

        res.json({
            status: 'success',
            message:
                'If the email exists in our system, we will send you an email with OTP shortly. OTP expires in 15 minutes.',
        });
    } catch (error) {
        console.log(error);
        res.json({
            status: 'error',
            message: 'Error, unable to process your request.',
        });
    }
});

export default Router;
