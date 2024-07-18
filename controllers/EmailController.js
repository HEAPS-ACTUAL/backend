const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const nodemailer = require("nodemailer");

// .env CONFIGS
const FRONTEND_ENDPOINT = process.env.FRONTEND_ENDPOINT;
const APP_EMAIL = process.env.APP_EMAIL;
const APP_EMAIL_PASSWORD = process.env.APP_EMAIL_PASSWORD;

// FUNCTIONS AND VARIABLES
const { generateVerificationToken } = require("./TokenController");

/*
creates the SMTP service that will be used to send emails
we are using an app password by google in the .env file
*/
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "login",
        user: APP_EMAIL,
        pass: APP_EMAIL_PASSWORD,
    },
});

//  Tests whether quizDaddy email is connected
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to send out emails");
        // sendVerificationEmail();
    }
});

async function sendVerificationEmail(req, res = null) {
    const inputEmail = req.body.email;
    const token = generateVerificationToken(inputEmail);

    try {
        const verificationLink = `${FRONTEND_ENDPOINT}/verify-email?token=${token}`;

        const info = await transporter.sendMail({
            from: `"quizDaddy" <${APP_EMAIL}>`, // sender address
            to: inputEmail, // list of receivers
            subject: "Email Verification for QuizDaddy", // Subject line
            // text: `Visit this link to verify your email: ${verificationLink}`,  // plain text body
            html: `
                <p> 
                    Hello! 
                    <br><br> 
                    Thank you for choosing quizDaddy. 
                    <br><br> 
                    To complete your registration, please <a href="${verificationLink}"> verify your email. </a> 
                </p>
                <br><br> 
                Best regards, 
                <br> 
                The Quizdaddy Team`, // html body
        });

        const msg = `Verification email sent successfully to ${inputEmail}. The message ID is: ${info.messageId}`;
        console.log(msg);

        if (res == null) {
            return msg;
        } else {
            return res.status(200).json({ message: msg });
        }
    } catch (error) {
        const msg = `Error sending verification email`;
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
    }
}

module.exports = { sendVerificationEmail };
