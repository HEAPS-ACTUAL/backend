// MODULES
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require("bcrypt"); // THIS PACKAGE IS FOR HASHING THE PASSWORD

// FUNCTIONS AND VARIABLES
const ACCESS_CODE = process.env.ACCESS_CODE;
const { sendVerificationEmail } = require("./EmailController");
const {execute, query} = require("../models/ConnectionManager");

/*
WHY IS "RES" SET TO NULL BY DEFAULT FOR THE getUserByEmail FUNCTION?

Because both the frontend and the function authenticate (as seen below) will call getUserByEmail.
When it is called directly by the frontend, the "res" parameter will be provided automatically
by router.get() (i think... HAHAHA), but when it is called by authenticate, the "res" parameter 
will not be provided and "res" will take on its default null value. We want the function to perform
differently depending on who is calling it (see if statement below).
*/

async function getUserByEmail(req, res = null) {
    const inputEmail = req.body.email || req.query.email;
    const sqlQuery = "Select Email, HashedPassword, FirstName, LastName, Gender, convert(DateTimeJoined, char) as DateTimeJoined, IsVerified from User where Email = ?";

    userFound = await execute(sqlQuery, [inputEmail]);
    userFound = userFound[0]; // RETURNING THE FIRST ELEMENT BECAUSE userFound IS A LIST CONTANING ONE USER OBJECT

    /*
    If the function is called without the "res" parameter, return a user object.
    Else, return a response to the frontend.
    */

    if (res == null) {
        return userFound;
    }
    else {
        if (userFound) {
            return res.status(200).json(userFound);
        }
        else {
            return res.status(401).json(userFound);
        }
    }
}

async function authenticate(req, res) {
    const userFound = await getUserByEmail(req);

    if (userFound == undefined) {
        return res.status(401).json({ message: "Email does not exist. Please create an account." });
    }
    else {
        const hashedPassword = userFound.HashedPassword;
        const inputPassword = req.body.password;
        
        if (await bothPasswordsMatch(inputPassword, hashedPassword)) { // FUNCTION DEFINED BELOW
            return res.status(200).json({ message: "Authentication Successful!" });
        }
        else {
            return res.status(401).json({ message: "Wrong password. Login failed!" });
        }
    }
}

// If passwords match, return true, else return false.
async function bothPasswordsMatch(inputPassword, hashedPassword) {
    const comparePassword = await bcrypt.compare(inputPassword, hashedPassword);

    return comparePassword; 
}

async function createNewUser(req, res) {
    const inputEmail = req.body.email;
    const inputPassword = req.body.password;
    const inputFirstName = req.body.firstName;
    const inputLastName = req.body.lastName;
    const inputGender = req.body.gender;
    const inputAccessCode = req.body.accessCode;

    const pass_salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(inputPassword, pass_salt);

    if (inputAccessCode !== ACCESS_CODE){
        return res.status(401).json({ message: "Incorrect Access Code!" });
    }

    try {
        const sqlQuery = "Insert into User (Email, HashedPassword, FirstName, LastName, Gender, AccessCode) values (?, ?, ?, ?, ?, ?)";
        const insertOk = await execute(sqlQuery, [inputEmail, hashedPassword, inputFirstName, inputLastName, inputGender, inputAccessCode]);

        if (insertOk) {
            sendVerificationEmail(req);
            return res.status(200).json({ message: "Account created! Please CHECK YOUR EMAIL to verify your account.", });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Email already exists!" });
    }
}

async function deleteUser(req, res) {
    const inputEmail = req.body.email;

    try {
        const sqlQuery = "DELETE FROM User WHERE Email = ?";
        const deleteResult = await execute(sqlQuery, [inputEmail]);

        if (deleteResult.affectedRows) {
            return res.status(200).json({ message: "Your account has been deleted." });
        }
        else {
            return res.status(404).json({ message: "User not found." });
        }
    }
    catch (error) {
        console.error("Failed to delete user:", error);
        return res.status(500).json({ message: "Failed to delete user." });
    }
}

async function updateUser(req, res) {
    
    /*
    INPUT FIRSTNAME AND INPUT LAST NAME WILL BE NULL WHEN CHANGING PASSWORD
    HASHEDPASSWORD, INPUT PASSWORD AND INPUT NEW PASSWORD WILL BE NULL WHEN CHANGING NAME
    */
    const inputEmail = req.body.email;
    const inputFirstName = req.body.firstName;
    const inputLastName = req.body.lastName;
    const hashedPassword = req.body.hashedPassword;
    const inputPassword = req.body.inputPassword;
    const inputNewPassword = req.body.newPassword;


    if(inputFirstName !== null && inputLastName !== null){ // NAME CHANGE
        try {
            const sqlQuery = "UPDATE User SET FirstName = ?, LastName = ? WHERE Email = ?";
            const updateResult = await execute(sqlQuery, [inputFirstName, inputLastName, inputEmail,]);
    
            if (updateResult.affectedRows) {
                return res.status(200).json({ message: "User details updated successfully." });
            }
            else {
                return res.status(404).json({ message: "User not found." });
            }
        }
        catch (error) {
            console.error("Failed to update user:", error);
            return res.status(500).json({ message: "Failed to update user." });
        }
    }
    else if(hashedPassword !== null && inputPassword !== null && inputNewPassword !== null){ // PASSWORD CHANGE
        if(await bothPasswordsMatch(inputPassword, hashedPassword) === false){
            return res.status(404).json({ message: "Password is incorrect!" }); 
        }
        else{
            const pass_salt = await bcrypt.genSalt();
            const newHashedPassword = await bcrypt.hash(inputNewPassword, pass_salt);
            
            try {
                const sqlQuery = "UPDATE User SET HashedPassword = ? WHERE Email = ?";
                const updateResult = await execute(sqlQuery, [newHashedPassword, inputEmail,]);
        
                if (updateResult.affectedRows) {
                    return res.status(200).json({ message: "Your password has been successfully changed!" });
                }
                else {
                    return res.status(404).json({ message: "User not found." });
                }
            }
            catch (error) {
                console.error("Failed to update user:", error);
                return res.status(500).json({ message: "Failed to update user." });
            }
        }
    }
}

// EXPORT ALL THE FUNCTIONS
module.exports = { getUserByEmail, authenticate, createNewUser, deleteUser, updateUser };
