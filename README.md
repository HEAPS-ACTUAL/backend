# quizDaddy

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## Introduction
quizDaddy is a web application for students to upload their notes and materials to generate flashcards and quizzes using ChatGPT API for their enhanced learning. Empowered by our spaced repetition algorithm, revision is structured and maximised for upcoming exams.

## Features
- User Authentication and Authorization: Secure sign-up and login using JWT. Email verification for users.
- CRUD Operations for Data Management: Full CRUD functionality for flashcards, quizzes, and user profiles.
- OpenAI Integration: Integrates with OpenAI’s ChatGPT API to generate quiz questions and answers from user-uploaded notes.
- Cross-Origin Resource Sharing (CORS): Configured CORS to allow secure communication between the frontend and backend.
- MySQL Database Integration: Efficient data storage and retrieval with complex queries.
- Input Validation and Error Handling: Ensures data integrity and security with meaningful error messages.
- Environment Configuration with dotenv: Manages sensitive data like API keys and database credentials.
- Spaced Repetition Algorithm: Schedules flashcard reviews to optimize learning and retention.
- Automated Email Notifications: Sends verification
- File Uploads with Multer: Supports uploading user notes and materials for generating quizzes and flashcards.

## Technologies Used
- Node.js
- Express
- MySQL
- dotenv
- nodemailer
- Json Web Tokens
- multer 
- bcrypt
- cors
- Openai
- pdf-parse
- punycode
- util
- whatwg-url
- nodemon

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/HEAPS-ACTUAL/backend.git
    cd backend
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Set up the database:
    ```sh
    # Assuming you have MySQL installed and running
    run quizDaddy.sql script in your MySQL Workbench environment

    ```

## Configuration
1. Create a `.env` file in the root directory and add the following configuration:
    ```
    # STANDARD CONFIGURATION
    BE_PORT=your-backend-port
    FE_PORT=your-frontend-port
    CHATGPT_MODEL="gpt-3.5-turbo"
    CHATGPT_ROLE="user"
    CHATGPT_TEMP="0.7"
    CHATGPT_MAX_TOKENS=3000
    CHATGPT_NUM_OF_QUESTIONS=12 # for quizzes
    APP_EMAIL=your-app-email # for sending emails
    APP_EMAIL_PASSWORD=your-gmail-app-password # generated by gmail
    JWT_SECRET_KEY=your-token-key # generated 32 byte string encoded in base 64 through openssl rand -base64 32 
    DB_NAME="heap" #quizDaddy.sql uses this database name

    # CHANGE ACCORDINGLY
    OPENAI_API_KEY=your-chatgpt-api-key
    DB_PASSWORD=your-db-password

    # TO CHANGE WHEN DEPLOYING
    DB_USER="root"
    DB_ENDPOINT="localhost"
    FRONTEND_ENDPOINT="http://localhost:3000"
    ```

## Usage
1. Start the backend server:
    ```sh
    npm run devStart
    ```
    You should see the following in the terminal:
    Server is listening on port 8001
    Successfully connected to DB!
    Server is ready to send out emails
    

2. The API will be available at `http://localhost:8001`.

3. Open Frontend Repository

## API Endpoints
Here are some of the main endpoints available:

### Email
- `POST /email/verify-email` - Verify a User Email through JWT Token
- `POST /email/send-verification-email` - Send a verification email to specified User

### Flashcard
- `GET /flashcard/getAllFlashcardsWithoutSchedule` - get an array of flashcards that have not been scheduled
- `GET /flashcard/getFlashcardsByScheduleID` - get an array of flashcards that have been scheduled in Calendar

### Quiz
- `POST /quiz/markQuizAsDone` - Set quiz completion in the database
- `POST /quiz/storeUserQuizAnswers` - Post a User's response for each question of a quiz in the DB 
- `GET /quiz/reviewQuiz` - get a JSON formatted array of questions and user's choices
- `GET /quiz/getLatestAttempt` - get the latest attempt number to store a new quiz

### Schedule
- `POST /schedule/createNewExam` - Post a new Exam Revision schedule using start date and end date
- `POST /schedule/retrieveAllRevisionDates` - get all the revision dates for calendar 
- `POST /schedule/deleteExistingExam` - delete all revision dates for specified flashcard from calendar
- `POST /schedule/deleteSpecificRevisionDate` - delete one specified date instead from the revision schedule

### Test
- `POST /test/generateAndStoreTest` - create a test from uploaded file and store in db
- `POST /test/deleteTest` - delete a test from db 
- `POST /test/getTestInfo` - get all the tests for the user
- `POST /test/getQuestionsAndOptions` - get questions and options for specified test

### User
- `POST /user/` - get all users (authentication purposes)
- `POST /user/profile` - get info for profile page
- `POST /user/authenticate` - authenticate user for log in
- `POST /user/register` - Register a new user
- `POST /user/is-verified` - get User verification status
- `POST /user/delete` - Delete a user's account
- `POST /user/update` - Update a user's attributes

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature-name`)
6. Open a Pull Request
