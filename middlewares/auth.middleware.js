import { verifyAccessJWT } from '../helpers/jwt.helper.js';

export const isUser = (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (authorization) {
            // validate the access JWT
            const decoded = verifyAccessJWT(authorization);
            console.log(decoded);
            return res.status(403).json({
                message: 'Unauthorized',
                status: 'error',
            });
        }

        // next();

        return res.status(403).json({
            message: 'Unauthorized',
            status: 'error',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Server error',
        });
    }
};
