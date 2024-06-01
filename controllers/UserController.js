const User = require('../classes/User')

// MOCK DATABASE
const UserDatabase = [
    new User('alice@gmail.com', 'alice1'),
    new User('bob@hotmail.com', 'bob1')
]

// FUNCTIONS RELATED TO USER
async function getAllUsers(req, res){
    const allUsers = UserDatabase;
    return res.status(200).json(allUsers);
}


/*
WHY IS "RES" SET TO NULL BY DEFAULT?

In the function getUserByEmail, the value of the parameter res is set as null by default
because both the frontend and the function authenticate (as seen below) will call getUserByEmail.
When it is called directly by the frontend, the "res" parameter will be provided automatically
by router.get(), but when it is called by authenticate, the "res" parameter will not be provided and "res"
will take on its default null value.
*/

async function getUserByEmail(req, res = null){
    const inputEmail = req.body.email;
    
    let userFound = null;

    for(let user of UserDatabase){
        const email = user.getEmail();

        if(email == inputEmail){
            userFound = user;
            break;
        }
    }
    
    /*
    If the function is called with the "res" parameter, return a response to the frontend.
    Else, return a user object.
    */
    
    if(res){
        if(userFound){
            return res.status(200).json(userFound);
        }
        else{
            return res.status(404).json(userFound);
        }
    }
    else{
        return userFound;
    }
}

async function authenticate(req, res){
    let userFound = getUserByEmail(req).body;
    return res.status(200).json(userFound);
    
    // const input_email = req.body.email;
    // const input_password = req.body.password;

    // for(let user of UserDatabase){
    //     const email = user.getEmail();
    //     const password = user.getPassword();

    //     if(email == input_email && password == input_password){
    //         return res.status(200).json({message: "Authentication Successful!"}); 
    //     }
    // }
    // return res.status(401).json({message: "Username or password is incorrect."});
}

// EXPORT ALL THE FUNCTIONS
module.exports = {getAllUsers, getUserByEmail, authenticate};