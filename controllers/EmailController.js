const query = require('../utils/PromisifyQuery');
const nodemailer = require('nodemailer');
require('dotenv').config();

app_email = process.env.app_email;
app_email_password = process.env.app_email_password;

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

async function sendVerificationEmail(inputEmail){
    try{
        const info = await transporter.sendMail({
            from: '"quizDaddy" <${app_email}>', // sender address
            to: inputEmail, // list of receivers
            subject: "Email Verification", // Subject line
            text: "Please verify your email using this link: ", // plain text body
            html: "<b>Please verify your email using this link: </b>", // html body
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


module.exports = { sendVerificationEmail };
