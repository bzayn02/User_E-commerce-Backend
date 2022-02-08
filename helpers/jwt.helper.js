import jwt from 'jsonwebtoken';
import { storeSession } from '../models/session/Session.model.js';
import { setRefreshJWT } from '../models/user-model/User.model.js';

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
const createRefreshJWT = async (_id, email) => {
    const token = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '30d',
    });

    // store in db

    const result = await setRefreshJWT(_id, token);
    if (result?._id) {
        return token;
    }
    return;
};

export const getJWTs = async ({ _id, email }) => {
    if (!_id && email) {
        return false;
    }
    const accessJWT = await createAccessJWT({ email });
    const refreshJWT = await createRefreshJWT(_id, email);
    return { accessJWT, refreshJWT };
};
