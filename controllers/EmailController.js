const nodemailer = require('nodemailer');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const HOST = "localhost";
const PORT = 3000;
// ABOVE SHOULD MOVE TO .env MOSTLY

const app_email = process.env.app_email;
const app_email_password = process.env.app_email_password;

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
        user: app_email,
        pass: app_email_password,
    },
});

//  Tests whether quizDaddy email is connected
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    }
    else {
        console.log("Server is ready to send out emails");
        // sendVerificationEmail();
    }
});

async function sendVerificationEmail(req, res = null) {
    const inputEmail = req.body.email;
    const token = generateVerificationToken(inputEmail);

    try {
        const verificationLink = `http://${HOST}:${PORT}/verify-email?token=${token}`
        const info = await transporter.sendMail({
            from: `"quizDaddy" <${app_email}>`, // sender address
            to: inputEmail, // list of receivers
            subject: "Email Verification for QuizDaddy", // Subject line
            // text: `Visit this link to verify your email: ${verificationLink}`,  // plain text body
            html: `<p>Hello! <br><br> Thank you for choosing quizDaddy. <br><br> To complete your registration, please <a href="${verificationLink}">verify your email.<p> </a>Best regards, <br> The Quizdaddy Team`, // html body
        });
        console.log(info);
        const msg = `Verification Email Sent Successfully to ${inputEmail}`;
        console.log(`${msg}: ${info.messageId}`);
        // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
        
        if (res == null){
            return msg;
        }
        else{
            return res.status(200).json({message: msg}) 
        }
    }
    catch (error) {
        const msg = `Error sending verification email`;
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
    }
}

module.exports = { sendVerificationEmail };
