import jwt from 'jsonwebtoken';
import { storeSession } from '../models/session/Session.model.js';
const createAccessJWT = async (userInfo) => {
    const token = jwt.sign(userInfo, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '15m',
    });

    // store in db
    const result = await storeSession({ type: 'accessJWT', token });
    if (result?._id) {
        return token;
    }
    return;
};
const createRefreshJWT = (userInfo) => {
    return jwt.sign(userInfo, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '30d',
    });

    // store in db
};

export const getJWTs = async (userInfo) => {
    const accessJWT = await createAccessJWT(userInfo);
    const refreshJWT = createRefreshJWT(userInfo);
    return { accessJWT, refreshJWT };
};
