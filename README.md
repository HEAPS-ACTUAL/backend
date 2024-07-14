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
- [License](#license)

## Introduction
quizDaddy is a RESTful API built with Node.js, Express, and MySQL. 

## Features
- User authentication and authorization
- CRUD operations for managing data
- Integration with MySQL database
- Input validation and error handling
- Environment configuration with dotenv

## Technologies Used
- Node.js
- Express
- MySQL
- dotenv
- nodemailer
- PromisifyQuery

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

## Configuration (to be edited)
1. Create a `.env` file in the root directory and add the following configuration:
    ```plaintext
    PORT=8001
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=heap
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-email-password (we opted for "app password" by google security)
    OPENAI_API_KEY=your-openai-api-key
    ```

## Usage
1. Start the server:
    ```sh
    npm run devStart

    You should see the following:
    Server is listening on port 8001
    Successfully connected to DB!
    Server is ready to send out emails
    ```

2. The API will be available at `http://localhost:8001`.

## API Endpoints
Here are some of the main endpoints available:

### Authentication (To be edited)
- `POST /auth/signup` - Register a new user
- `POST /auth/login` -

### Users (To be edited)
- `GET /users` - Get a list of all users (requires authentication)
- `GET /users/:id` - Get details of a specific user (requires authentication)
- `PUT /users/:id` - Update a user's details (requires authentication)
- `DELETE /users/:id` - Delete a user (requires authentication)

### Items (To be edited)
- `GET /items` - Get a list of all items
- `GET /items/:id` - Get details of a specific item
- `POST /items` - Create a new item (requires authentication)
- `PUT /items/:id` - Update an item (requires authentication)
- `DELETE /items/:id` - Delete an item (requires authentication)

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature-name`)
6. Open a Pull Request

## License
Not licensed.