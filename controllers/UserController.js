const User = require('../classes/User')

// MOCK DATABASE
const UserDatabase = [
    new User('alice', 'alice1'),
    new User('bob', 'bob1')
]

// FUNCTIONS
function getAllUsers(req, res){
    const allUsers = UserDatabase;
    return res.status(200).json(allUsers);
}

function authenticate(req, res){
    const input_username = req.body.username;
    const input_password = req.body.password;

    for(let user of UserDatabase){
        const username = user.getUsername();
        const password = user.getPassword();

        if(username == input_username && password == input_password){
            return res.status(200).json({message: "Authentication Successful!"}); 
        }
        else{
            return res.status(401).json({message: "Username or password is incorrect."});
        }
    }
}


// EXPORT ALL THE FUNCTIONS
module.exports = {getAllUsers, authenticate};