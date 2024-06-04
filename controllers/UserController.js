const query = require('../utils/Promisify');
const bcrypt = require('bcrypt'); // THIS PACKAGE IS FOR HASHING THE PASSWORD
const fileUpload = require("express-fileupload");
const PDFParser = require("pdf-parse");
const multer = require('multer');
const pdf = require('html-pdf');

// FUNCTIONS RELATED TO USER
async function getAllUsers(req, res){
    const sqlQuery = 'Select * from user';
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
    const sqlQuery = 'Select * from user where email = ?';
    
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
            return res.status(404).json(userFound);
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

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(inputPassword, salt);

    try{
        const sqlQuery = "Insert into user (Email, HashedPassword, FirstName, LastName, Gender) values (?, ?, ?, ?, ?)";
        const insertOk = await query(sqlQuery, [inputEmail, hashedPassword, inputFirstName, inputLastName, inputGender]);
        
        if(insertOk){
            return res.status(200).json({message: "Account created!"});
        }
    }
    catch(error){
        return res.status(401).json({message: "Email already exists!"});
    }
}

async function uploadFile(req, res){
    try {
        console.log('Received a file upload request');
        if (!req.file){
            return res.status(400).json({message: "No file uploaded!"});
        }
         
        const uploadedFile = req.file;
        const fileBuffer = uploadedFile.buffer
        // console.log(uploadedFile);

        processPDF(fileBuffer);
        // console.log(pdfParse(req.files.pdfFile)); // testing pdf to text conversion
        return res.status(200).json({message: "File successfully uploaded"});
    } catch(error) {
        console.error('An error occurred while processing the file:', error);
        res.status(500).json({ error: 'Failed to process the file' });
    }
   
}

// Helper function
async function processPDF(fileBuffer) {
    try {
        console.log("Processing a PDF file!")
        // Parse the PDF content
        const data = await PDFParser(fileBuffer);
        const pdfText = data.text;
        console.log(pdfText);

    } catch (error){
        console.error('An error occurred while processing the PDF:', error);
        res.status(500).json({ error: 'Failed to process the PDF' });
    }
}

// EXPORT ALL THE FUNCTIONS 
module.exports = {getAllUsers, getUserByEmail, authenticate, createNewUser, uploadFile};