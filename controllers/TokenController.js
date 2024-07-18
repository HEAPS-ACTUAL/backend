const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const query = require('../utils/PromisifyQuery');
const jwt = require('jsonwebtoken'); // THIS PACKAGE IS FOR THE TOKEN

// .env VARIABLES
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const generateVerificationToken = (email) => {
    const token = jwt.sign({ email }, JWT_SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour
    return token;
};

async function verifyToken(req, res){
    const token = req.body.token
    try{
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        const email = decoded.email;

        const updateOk = await updateUserVerification(email); // Update the user's email verification status in the database

        if (updateOk){
            console.log(`Verification for ${email} successful!`)
            return res.status(200).json({message: "Verification Successful!"});
        }
        else {
            return res.status(401).json({message: "Verification Failed!"});
        }
    } 
    catch(error){
        console.error('Error verifying token:', error);
        return res.status(400).json({ success: false, message: 'Invalid token' });
    }
}

async function updateUserVerification(inputEmail){
    try{
        const sqlQuery = "Update User set isVerified = true where Email = ?";
        const updateOk = await query(sqlQuery, [inputEmail]);
        return updateOk;
    }
    catch(error){
        console.error("Update was Unsuccessful!");
    }
}

module.exports = {verifyToken, generateVerificationToken};