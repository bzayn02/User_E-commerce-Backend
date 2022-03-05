import express from 'express';

const Router = express.Router();

import {
    createUser,
    verifyEmail,
    getUserByEmail,
    removeRefreshJWT,
    updateUserProfile,
} from '../models/user-model/User.model.js';
import {
    createUniqueEmailConfirmation,
    findUserEmailVerification,
    deleteInfo,
} from '../models/reset-pin/Pin.model.js';
import { removeSession } from '../models/session/Session.model.js';
import {
    createUserValidation,
    userEmailVerificationValidation,
    loginUserFormValidation,
} from '../middlewares/formValidation.middleware.js';
import { hashPassword, comparePassword } from '../helpers/bcrypt.helper.js';

import {
    sendEmailVerificationConfirmation,
    sendEmailVerificationLink,
} from '../helpers/email.helper.js';
import { isUser } from '../middlewares/auth.middleware.js';

import { getJWTs } from '../helpers/jwt.helper.js';

Router.all('/', (req, res, next) => {
    console.log(req.body);
    next();
});

// return user
Router.get('/', isUser, (req, res) => {
    res.json({
        status: 'success',
        message: 'User profile',
        user: req.user,
    });
});

// create new user
Router.post('/', createUserValidation, async (req, res) => {
    try {
        // TODO
        //encrypt password
        const hashPass = hashPassword(req.body.password);
        if (hashPass) {
            req.body.password = hashPass;

            const { _id, fname, email } = await createUser(req.body);
            if (_id) {
                // create unique activation link
                const { pin } = await createUniqueEmailConfirmation(email);

                const forSendingEmail = {
                    fname,
                    email,
                    pin,
                };
                if (pin) {
                    // email the link to the user email
                    sendEmailVerificationLink(forSendingEmail);
                }

                return res.json({
                    status: 'success',
                    message:
                        'New user has been created successfully! We have sent an email confirmation link to your email, please check and follow the instruction to activate your account.',
                });
            }
        }
        res.json({
            status: 'error',
            message: 'Unable to  create new user',
        });
    } catch (error) {
        let msg = 'Error, unable to create new user';
        console.log(error.message);
        if (error.message.includes('E11000 duplicate key error')) {
            msg = 'This email has been already used by another user.';
        }
        res.json({
            status: 'error',
            message: msg,
        });
    }
});

//update user profile
Router.patch('/', isUser, async (req, res) => {
    try {
        const { _id } = req.user;
        console.log(_id, req.body);

        if (_id) {
            const result = await updateUserProfile(_id, req.body);

            if (result?._id) {
                return res.json({
                    status: 'success',
                    message: 'User profile has been updated successfully.',
                });
            }
        }
        return res.json({
            status: 'error',
            message: 'Unable to update the profile. Please try again later.',
        });
    } catch (error) {
        console.log(error);
    }
});

//email verification
Router.patch(
    '/email-verification',
    userEmailVerificationValidation,
    async (req, res) => {
        try {
            const result = await findUserEmailVerification(req.body);
            if (result?._id) {
                //To Do
                //Information is valid. Now we can update the user
                const data = await verifyEmail(result.email);
                console.log(data, 'from verify email');

                if (data?._id) {
                    //Delete the reset-pin info
                    deleteInfo(req.body);

                    //sendEmail confirmation to user
                    sendEmailVerificationConfirmation({
                        fname: data.fname,
                        email: data.email,
                    });
                    return res.json({
                        status: 'success',
                        message:
                            'Your email has been verified, you may login in now.',
                    });
                }
            }

            res.json({
                status: 'error',
                message:
                    'Unable to verify your email, either the link is invalid or expired',
            });
        } catch (error) {
            res.json({
                status: 'error',
                message:
                    'Error, Unable to verify the email, please try again later.',
            });
        }
    }
);

// user login
Router.post('/login', loginUserFormValidation, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmail(email);
        if (user?._id && user?.role === 'user') {
            // check if password is valid or not

            const isPassMatched = comparePassword(password, user.password);
            if (isPassMatched) {
                // get JWTs then send to the client
                const jwts = await getJWTs({
                    _id: user._id,
                    email: user.email,
                });
                user.password = undefined;

                return res.json({
                    status: 'success',
                    message: 'login success',
                    jwts,
                    user,
                });
            }
        }

        res.status(401).json({
            status: 'error',
            message: 'Unauthorized',
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error, unable to login now. Please try again later.',
        });
    }
});

// user logout
Router.post('/logout', async (req, res) => {
    try {
        const { accessJWT, refreshJWT } = req.body;
        accessJWT && (await removeSession(accessJWT));
        refreshJWT && (await removeRefreshJWT(refreshJWT));
        res.json({
            status: 'success',
            message: 'Logging out.',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            message: 'Error, unable to logout now. Please try again later.',
        });
    }
});

export default Router;
