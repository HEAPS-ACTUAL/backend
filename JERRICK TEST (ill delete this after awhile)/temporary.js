const CHATGPT_response = 
`{
    "QuestionNumber": 1,
    "ActualQuestion": "What is the purpose of the backend in this project?",
    "Explanation": "The backend is responsible for providing JSON data to the frontend.",
    "Options" : 
        [
        {"Option": "Rendering dynamic elements on the frontend", "IsCorrect?": false},
        {"Option": "Interacting with the database", "IsCorrect?": false},
        {"Option": "Providing JSON data to the frontend", "IsCorrect?": true},
        {"Option": "Styling the user interface", "IsCorrect?": false}
        ]
}
|||
{
    "QuestionNumber": 2,
    "ActualQuestion": "Which command is used to install express framework in the backend?",
    "Explanation": "The command 'npm i express' is used to install the express framework.",
    "Options" : 
        [
        {"Option": "npm start", "IsCorrect?": false},
        {"Option": "npm i mongoose", "IsCorrect?": false},
        {"Option": "npm i express", "IsCorrect?": true},
        {"Option": "npm init -y", "IsCorrect?": false}
        ]
}
|||
{
    "QuestionNumber": 3,
    "ActualQuestion": "What is the purpose of nodemon in the project setup?",
    "Explanation": "Nodemon enables auto refreshing without manually killing and restarting the server to observe changes.",
    "Options" : 
        [
        {"Option": "To install node modules", "IsCorrect?": false},
        {"Option": "To connect to the database", "IsCorrect?": false},
        {"Option": "To enable auto refreshing of the server", "IsCorrect?": true},
        {"Option": "To define the MongoDB path", "IsCorrect?": false}
        ]
}
|||
{
    "QuestionNumber": 4,
    "ActualQuestion": "What is the purpose of creating a model file under the models folder?",
    "Explanation": "The model file defines the schema required for tasks in the database.",
    "Options" : 
        [
        {"Option": "To install mongoose module", "IsCorrect?": false},
        {"Option": "To define the MongoDB path", "IsCorrect?": false},
        {"Option": "To define the schema for tasks", "IsCorrect?": true},
        {"Option": "To interact with the database", "IsCorrect?": false}
        ]
}
|||
{
    "QuestionNumber": 5,
    "ActualQuestion": "What is the purpose of axios in the project?",
    "Explanation": "Axios is used to make HTTP requests from the frontend to the backend.",
    "Options" : 
        [
        {"Option": "To define the schema for tasks", "IsCorrect?": false},
        {"Option": "To interact with the database", "IsCorrect?": false},
        {"Option": "To make HTTP requests from frontend to backend", "IsCorrect?": true},
        {"Option": "To install express framework", "IsCorrect?": false}
        ]
}
|||
{
    "QuestionNumber": 6,
    "ActualQuestion": "What does the 'npm run devStart' command do?",
    "Explanation": "The 'npm run devStart' command starts the backend server using nodemon.",
    "Options" : 
        [
        {"Option": "Installs node modules", "IsCorrect?": false},
        {"Option": "Starts the frontend server", "IsCorrect?": false},
        {"Option": "Starts the backend server using nodemon", "IsCorrect?": true},
        {"Option": "Defines the MongoDB path", "IsCorrect?": false}
        ]
}
|||
{
    "QuestionNumber": 7,
    "ActualQuestion": "What is the purpose of the 'status()' function in the backend?",
    "Explanation": "The 'status()' function is used to return a status code in the response.",
    "Options" : 
        [
        {"Option": "To define the default endpoint", "IsCorrect?": false},
        {"Option": "To return a status code in the response", "IsCorrect?": true},
        {"Option": "To create a new task", "IsCorrect?": false},
        {"Option": "To connect to the database", "IsCorrect?": false}
        ]
}
|||
{
    "QuestionNumber": 8,
    "ActualQuestion": "What is the purpose of the 'json()' function in the backend?",
    "Explanation": "The 'json()' function is used to return the response body in JSON format.",
    "Options" : 
        [
        {"Option": "To return a status code in the response", "IsCorrect?": false},
        {"Option": "To create a new task", "IsCorrect?": false},
        {"Option": "To return the response body in JSON format", "IsCorrect?": true},
        {"Option": "To define the default endpoint", "IsCorrect?": false}
        ]
}
|||
{
    "QuestionNumber": 9,
    "ActualQuestion": "What is the purpose of the 'async' keyword in the controller functions?",
    "Explanation": "The 'async' keyword is used to make the function asynchronous.",
    "Options" : 
        [
        {"Option": "To define the default endpoint", "IsCorrect?": false},
        {"Option": "To make the function synchronous", "IsCorrect?": false},
        {"Option": "To interact with the database", "IsCorrect?": false},
        {"Option": "To make the function asynchronous", "IsCorrect?": true}
        ]
}
|||
{
    "QuestionNumber": 10,
    "ActualQuestion": "What is the purpose of the 'db.once' function in connecting to the database?",
    "Explanati n": "The 'db.once' function is used to run a function once the database connection is open.",
    "Options" : 
        [
        {"Option": "To run a function upon receiving an error", "IsCorrect?": false},
        {"Option": "To define the MongoDB path", "IsCorrect?": false},
        {"Option": "To check the database connection", "IsCorrect?": false},
        {"Option": "To run a function once the connection is open", "IsCorrect?": true}
        ]
}||`

module.exports = CHATGPT_response;