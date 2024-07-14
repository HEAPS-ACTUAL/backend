const query = require('../utils/PromisifyQuery');
const bcrypt = require('bcrypt'); // THIS PACKAGE IS FOR HASHING THE PASSWORD
const jwt = require('jsonwebtoken'); // THIS PACKAGE IS FOR THE TOKEN
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;


// FUNCTIONS AND VARIABLES
const { sendVerificationEmail, generateVerificationToken } = require("./EmailController");

// FUNCTIONS RELATED TO USER
async function getAllUsers(req, res){
    const sqlQuery = 'Select * from User';
    const allUsers = await query(sqlQuery);

    return res.status(200).json(allUsers);
}


/*
WHY IS "RES" SET TO NULL BY DEFAULT FOR THE getUserByEmail FUNCTION?

Because both the frontend and the function authenticate (as seen below) will call getUserByEmail.
When it is called directly by the frontend, the "res" parameter will be provided automatically
by router.get() (i think... HAHAHA), but when it is called by authenticate, the "res" parameter 
will not be provided and "res" will take on its default null value. We want the function to perform
differently depending on who is calling it (see if statement below).
*/

async function getUserByEmail(req, res = null){
    const inputEmail = req.body.email;
    const sqlQuery = 'Select * from User where Email = ?';

    userFound = await query(sqlQuery, [inputEmail]);
    userFound = userFound[0]; // RETURNING THE FIRST ELEMENT BECAUSE userFound IS A LIST CONTANING ONE USER OBJECT
    
    /*
    If the function is called without the "res" parameter, return a user object.
    Else, return a response to the frontend.
    */
    
    if(res == null){
        return userFound; 
        
    }
    else{
        if(userFound){
            return res.status(200).json(userFound);
        }
        else{
            return res.status(401).json(userFound);
        }
    }
}

async function authenticate(req, res){
    const userFound = await getUserByEmail(req);
    
    if(userFound == undefined){
        return res.status(401).json({message: "Email does not exist. Please create an account."});
    }
    else{
        const hashedPassword = userFound.HashedPassword;
        const inputPassword = req.body.password;

        const comparePassword = await bcrypt.compare(inputPassword, hashedPassword);
        
        if(comparePassword == true){
            return res.status(200).json({message: "Authentication Successful!"});
        }
        else{
            return res.status(401).json({message: "Wrong password. Login failed!"});
        }
    }
}

async function createNewUser(req, res){
    const inputEmail = req.body.email;
    const inputPassword = req.body.password;
    const inputFirstName = req.body.firstName;
    const inputLastName = req.body.lastName;
    const inputGender = req.body.gender;
    const isVerified = false;

    const pass_salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(inputPassword, pass_salt);
    const verificationToken = await generateVerificationToken(inputEmail);
    try{
        const sqlQuery = "Insert into User (Email, HashedPassword, FirstName, LastName, Gender, IsVerified, VerificationToken ) values (?, ?, ?, ?, ?, ?, ?)";
        const insertOk = await query(sqlQuery, [inputEmail, hashedPassword, inputFirstName, inputLastName, inputGender, isVerified, verificationToken]);
        
        if(insertOk){
            sendVerificationEmail(inputEmail, verificationToken);
            return res.status(200).json({message: "Account created! Click ok to sign in"});
        }
    }
    catch(error){
        return res.status(401).json({message: "Email already exists!"});
    }
}


async function verifyToken(req, res){
    const token = req.body.token
    try{
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        const email = decoded.email;

        const updateOk = await updateUserVerificationStatus(email); // Update the user's email verification status in the database

        if (updateOk){
            return res.status(200).json({message: "Verification Successful!"});
        }
        else {
            return res.status(401).json({message: "Verification Failed!"});
        }
    } catch(error){
        console.error('Error verifying token:', error);
        return res.status(400).json({ success: false, message: 'Invalid token' });
    }
}

async function updateUserVerificationStatus(inputEmail){
    try{
        const sqlQuery = "Update User set isVerified = true, VerificationToken = null where email = ?";
        const updateOk = await query(sqlQuery, [inputEmail]);
        return updateOk;
    }
    catch(error){
        console.error("Update was Unsuccessful!");
    }
}
// async function generateTokenExpiry(){
//     const duration = 3600000 // 1-hour in miliseconds
//     const localDateString = new Date().toLocaleDateString("en-GB").split("/");
//     const localTimeString = new Date(Date.now() + duration).toLocaleTimeString("en-GB");
//     const tokenExpiry = localDateString[2] + "-" + localDateString[1] +"-"+ localDateString[0] + ", " + localTimeString;
//     return tokenExpiry;
// }

// EXPORT ALL THE FUNCTIONS 
module.exports = {getAllUsers, getUserByEmail, authenticate, createNewUser, verifyToken};