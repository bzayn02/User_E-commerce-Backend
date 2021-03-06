import nodemailer from 'nodemailer';

const send = async (infoObj) => {
    try {
        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SMTP,
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        // send mail with defined transport object\
        let info = await transporter.sendMail(infoObj);

        console.log('Message sent: %s', info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    } catch (error) {
        console.log(error);
    }
};

export const emailProcessor = ({ email, subject, text, html }) => {
    let info = {
        from: `"E-Shop"<${process.env.EMAIL_USER}>`, // sender address
        to: email, // list of receivers
        subject, // Subject line
        text,
        html,
    };
    send(info);
};

export const sendEmailVerificationLink = (emailObj) => {
    const { fname, pin, email } = emailObj;
    const link = `http://localhost:3000/email-verification?pin=${pin}&email=${email}`;
    const obj = {
        ...emailObj,
        subject: 'Email Confirmation Required.',
        text: `Hi ${fname}, please follow the link below to confirm your email.
        <a href="${link}" target="_blank">${link}</a>`,
        html: `
            Hello there,
            <br/>
            Please follwo the link below to confirm your email. <br/><br/>
           <a href="${link}" target="_blank">${link}</a>
            <br/><br/>
            Thank you <br/><br/>
            <Kind Regards,
            --Some Company Information--`,
    };

    emailProcessor(obj);
};

// send the email confirm welcome message
export const sendEmailVerificationConfirmation = (emailObj) => {
    const { fname } = emailObj;

    const obj = {
        ...emailObj,
        subject: 'Email Verification Successful!',
        text: `Hi ${fname}, Your email has been verified, you may login now!
                `,
        html: `
            Hello ${fname},
            <br/>
            Your email has been verified, you may login now! <br/><br/>
            <br/><br/>
            Thank you <br/><br/>
            <Kind Regards,
            --Some Company Information--`,
    };

    emailProcessor(obj);
};
// send the email notification for password update
export const sendUpdatePasswordNotification = (emailObj) => {
    const { fname } = emailObj;

    const obj = {
        ...emailObj,
        subject: 'Password Update Successful!',
        text: `Hi ${fname}, Your password has been updated! If you did not make this change please contact us immediately.
                `,
        html: `
            Hello ${fname},
            <br/>
            Your password has been updated!  If you did not make this change please contact us immediately.<br/><br/>
            <br/><br/>
            Thank you <br/><br/>
            <Kind Regards,
            --Some Company Information--`,
    };

    emailProcessor(obj);
};
export const sendPasswordResetOTP = (emailObj) => {
    const { fname, otp } = emailObj;

    const obj = {
        ...emailObj,
        subject: 'Reset password OTP',
        text: `Hi ${fname}, Please use the following OTP to reset your password.<br/>
${otp}. <br/>The OTP will expire in 15 minutes.                `,
        html: `
            Hello ${fname},
            <br/>
            Please use the following OTP to reset your password.<br/>
            ${otp}.<br/> The OTP will expire in 15 minutes.  <br/><br/>
            <br/><br/>
            Thank you <br/><br/>
            <Kind Regards,
            --Some Company Information--`,
    };

    emailProcessor(obj);
};
