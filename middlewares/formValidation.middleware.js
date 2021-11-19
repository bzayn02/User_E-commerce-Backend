import Joi from 'joi';

export const createUserValidation = (req, res, next) => {
    //server side validation
    const schema = Joi.object({
        fname: Joi.string().max(20).required().alphanum(),
        lname: Joi.string().max(20).required().alphanum(),
        email: Joi.string().max(50).required().email({
            minDomainSegments: 2,
        }),
        password: Joi.string().min(8).required(),
        phone: Joi.string().max(15),
        address: Joi.string().max(100),
        dob: Joi.date(),
        gender: Joi.string().max(6),
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
