const User = require('../classes/User');
const con = require('../models/ConnectionManager');
const callback = require('../models/Callback function');

// MOCK DATABASE
// const UserDatabase = [
//     new User('alice@gmail.com', 'alice1'),
//     new User('bob@hotmail.com', 'bob1')
// ]

// FUNCTIONS RELATED TO USER
async function getAllUsers(req, res){
    const sqlQuery = 'Select * from user';

    const allUsers = con.query(sqlQuery, callback);

    console.log(allUsers);
    con.end();
    
    // return res.status(200).json(allUsers);

    // const allUsers = UserDatabase;
    // return res.status(200).json(allUsers);
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
    
    let userFound = null;

    for(let user of UserDatabase){
        const email = user.getEmail();

        if(email === inputEmail){
            userFound = user;
            break;
        }
    }
    
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
    
    if(userFound == null){
        return res.status(401).json({message: "Email does not exist. Please create an account."});
    }
    else{
        const actualPassword = userFound.getPassword();
        const inputPassword = req.body.password;

        if(actualPassword === inputPassword){
            return res.status(200).json({message: "Authentication Successful!"});
        }
        else{
            return res.status(401).json({message: "Wrong password. Login failed!"});
        }
    }
}

// EXPORT ALL THE FUNCTIONS
module.exports = {getAllUsers, getUserByEmail, authenticate};