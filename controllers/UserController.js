const User = require('../classes/User')

// MOCK DATABASE
const UserDatabase = [
    new User('alice', 'alice1'),
    new User('bob', 'bob1')
]

// FUNCTIONS
function getAllUsers(req, res){
    const allUsers = UserDatabase;
    return response.status(200).json(allUsers);
}