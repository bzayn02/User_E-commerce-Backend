import mongoose from 'mongoose';

const PinSchema = mongoose.Schema(
    {
        pin: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            max: 50,
        },
        type: {
            type: String,
            default: 'emailValidation',
            max: 50,
        },
    },
    {
        timestamps: true,
    }
);

const Pin = mongoose.model('Pin', PinSchema);
export default Pin;
