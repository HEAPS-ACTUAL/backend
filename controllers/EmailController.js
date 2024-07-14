require('dotenv').config();
const nodemailer = require('nodemailer');
const HOST = "localhost";
const PORT = 3000;
const app_email = process.env.app_email;
const app_email_password = process.env.app_email_password;
// ABOVE SHOULD MOVE TO .env MOSTLY

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

async function sendVerificationEmail(req, res){ 
    const inputEmail = req.body.email;   
    const token = generateVerificationToken(inputEmail);
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
          return res.status(200).json({message: "Verification Email sent Successfully"})
    }
    catch(error){
        const msg = `Error sending verification email`;
        console.error(`${msg}: ${error.message}`);
        return res.status(404).json({ message: msg });
    }
}


module.exports = { sendVerificationEmail};
