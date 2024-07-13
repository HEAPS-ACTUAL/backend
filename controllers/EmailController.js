const nodemailer = require('nodemailer');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const HOST = "localhost";
const PORT = 3000;
const app_email = process.env.app_email;
const app_email_password = process.env.app_email_password;
const JWT_SECRET_KEY= process.env.JWT_SECRET_KEY;

// FUNCTIONS AND VARIABLES

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
transporter.verify(function (error, success) {
if (error) {
    console.log(error);
} else {
    console.log("Server is ready to send out emails");
    // sendVerificationEmail();
}
});



const generateVerificationToken = (email) => {
    const token = jwt.sign({ email }, JWT_SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour
    return token;
};


async function sendVerificationEmail(inputEmail, token){
    try{
        const verificationLink = `http://${HOST}:${PORT}/verify-email?token=${token}`
        const info = await transporter.sendMail({
            from: `"quizDaddy" <${app_email}>`, // sender address
            to: inputEmail, // list of receivers
            subject: "Email Verification", // Subject line
            text: `Visit this link to verify your email: ${verificationLink}`,  // plain text body
            html: `<a href="${verificationLink}"><H2>Click on this</H2></a>`, // html body
          });
        
          console.log("Verification Email Sent Successfully: %s", info.messageId);
          // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
        }
    catch(error){
        const msg = `Error sending verification email`;
        console.error(`${msg}: ${error.message}`);
        res.status(404).json({ message: msg });
    }
    }


module.exports = { sendVerificationEmail, generateVerificationToken};
