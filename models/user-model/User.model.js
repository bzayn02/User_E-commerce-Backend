import UserSchema from './User.schema.js';

export const createUser = (newUser) => {
    try {
        const result = UserSchema(newUser).save();
        return result;
    } catch (error) {
        throw new Error(error);
    }
};
