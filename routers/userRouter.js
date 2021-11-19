import express from 'express';

const Router = express.Router();

import { createUser } from '../models/user-model/User.model.js';
import { createUserValidation } from '../middlewares/formValidation.middleware.js';
import { hashPassword } from '../helpers/bcrypt.helper.js';

Router.all('/', (req, res, next) => {
    console.log(req.body);
    console.log('From user router');
    next();
});

Router.post('/', createUserValidation, async (req, res) => {
    try {
        // TODO
        //encrypt password
        const hashPass = hashPassword(req.body.password);
        if (hashPass) {
            req.body.password = hashPass;
            console.log(hashPass);

            const result = await createUser(req.body);
            if (result?._id) {
                //Todo
                //create unique activation link and email the link to the user email
                return res.json({
                    state: 'success',
                    message:
                        'New user has been created successfully! We have sent an email confirmation link to your email, please check and follow the instruction to activate your account.',
                });
            }
        }
        res.json({
            state: 'error',
            message: 'Unable to  create new user',
        });
    } catch (error) {
        let msg = 'Error, unable to create new user';
        console.log(error.message);
        if (error.message.includes('E11000 duplicate key error')) {
            msg = 'This email has been already used by another user.';
        }
        res.json({
            state: 'error',
            message: msg,
        });
    }
});

export default Router;
