import express from 'express';
import { createAccessJWT } from '../helpers/jwt.helper.js';

import { getUserByEmailAndRefreshToken } from '../models/user-model/User.model.js';

import { verifyRefreshJWT } from '../helpers/jwt.helper.js';

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

export default Router;
