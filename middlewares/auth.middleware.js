import { verifyAccessJWT } from '../helpers/jwt.helper.js';
import { getSession } from '../models/session/Session.model.js';
import { getUserById } from '../models/user-model/User.model.js';

export const isUser = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (authorization) {
            // validate the access JWT
            const decoded = verifyAccessJWT(authorization);
            // for the user unauthorised access to send jwt expired message
            if (decoded === 'jwt expired') {
                return res.status(403).json({
                    status: 'error',
                    message: 'jwt expired',
                });
            }
            const session = decoded?.email
                ? await getSession({ token: authorization })
                : null;

            if (session?._id) {
                req.userId = session.userId;

                // get the user from the db and check for the role
                const user = await getUserById(session.userId);
                if (user.role === 'user') {
                    req.user = user;

                    next();
                    return;
                }
            }
        }

        return res.status(401).json({
            message: 'Unauthorized',
            status: 401,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Server error',
        });
    }
};
