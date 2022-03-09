import Joi from 'joi';

const plainShortStr = Joi.string().max(20).required();
const shortStrNull = Joi.string().max(30).allow(null).allow('');
const _id = Joi.string().max(30);
const shortStr = Joi.string().max(20).required().alphanum();
const password = Joi.string().min(8).required();
const email = Joi.string().max(50).required().email({
    minDomainSegments: 2,
});

export const createUserValidation = (req, res, next) => {
    //server side validation
    const schema = Joi.object({
        fname: shortStr,
        lname: shortStr,
        email,
        password: Joi.string().min(8).required(),
        phone: Joi.string().max(15).allow(null).allow(''),
        address: Joi.string().max(100),
        dob: Joi.date().allow(null).allow(''),
        gender: Joi.string().max(6).allow(''),
    });

    const value = schema.validate(req.body);

    if (value.error) {
        return res.json({
            status: 'error',
            message: value.error.message,
        });
    }
    next();
};

export const userEmailVerificationValidation = (req, res, next) => {
    const schema = Joi.object({
        email,
        pin: Joi.string().min(6).required(),
    });

    const value = schema.validate(req.body);

    if (value.error) {
        return res.json({
            status: 'error',
            message: value.error.message,
        });
    }
    next();
};

export const passwordUpdateFormValidation = (req, res, next) => {
    try {
        const schema = Joi.object({
            currentPassword: password,
            password,
        });

        const { error } = schema.validate(req.body);
        if (error) {
            res.json({
                status: 'error',
                message: error.message,
            });
        }
        next();
    } catch (error) {
        res.json({
            status: 'error',
            message:
                'Error, unable to process your request. Please try again later.',
        });
    }
};
export const loginUserFormValidation = (req, res, next) => {
    try {
        const schema = Joi.object({
            email,
            password: plainShortStr,
        });

        const { error } = schema.validate(req.body);
        if (error) {
            res.json({
                status: 'error',
                message: error.message,
            });
        }
        next();
    } catch (error) {
        res.json({
            status: 'error',
            message:
                'Error, unable to process your request. Please try again later.',
        });
    }
};
