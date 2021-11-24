import express from 'express';

const Router = express.Router();

import { createUser, verifyEmail } from '../models/user-model/User.model.js';
import {
    createUserValidation,
    userEmailVerificationValidation,
} from '../middlewares/formValidation.middleware.js';
import { hashPassword } from '../helpers/bcrypt.helper.js';
import {
    createUniqueEmailConfirmation,
    findUserEmailVerification,
    deleteInfo,
} from '../models/session/Session.model.js';
import {
    sendEmailVerificationConfirmation,
    sendEmailVerificationLink,
} from '../helpers/email.helper.js';

Router.all('/', (req, res, next) => {
    console.log(req.body);
    next();
});

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
                    //Delete the session info
                    deleteInfo(req.body);

                    //sendEmail confirmation to user
                    sendEmailVerificationConfirmation({
                        fname: data.fname,
                        email: data.email,
                    });
                    return res.json({
                        status: 'Success',
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
export default Router;
