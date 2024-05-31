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
    const request_body = req.body;
    return res.status(200).json(request_body); 
}


// EXPORT ALL THE FUNCTIONS
module.exports = {getAllUsers, authenticate};