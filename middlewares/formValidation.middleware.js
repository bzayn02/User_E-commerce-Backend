import Joi from 'joi';

const shortStr = Joi.string().max(20).required().alphanum();
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
