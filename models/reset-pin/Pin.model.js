import PinSchema from './Pin.schema.js';
import { randomNumberGenerator } from '../../utils/randomGenerator.js';

// function to create a unique email validation info

export const createUniqueEmailConfirmation = async (email) => {
    try {
        // Generate random 6 digit number
        const pinLength = 6;
        const pin = randomNumberGenerator(pinLength);
        if (!pin || !email) {
            return false;
        }
        const newEmailValidation = {
            pin,
            email,
        };

        const result = await PinSchema(newEmailValidation).save();

        return result;
    } catch (error) {
        throw new Error(error);
    }
};

export const findUserEmailVerification = async (filterObj) => {
    try {
        const result = await PinSchema.findOne(filterObj); //{pin, email}

        return result;
    } catch (error) {
        throw new Error(error);
    }
};

export const deleteInfo = async (filterObj) => {
    try {
        const result = await PinSchema.findOneAndDelete(filterObj);
        return result;
    } catch (error) {
        throw new Error(error);
    }
};
