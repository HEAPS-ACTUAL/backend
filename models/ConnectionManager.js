/* 
Creating an connection instance to mySQL database.
*/

// FOR .ENV FILE
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mysql = require("mysql");

const DB_ENDPOINT = process.env.DB_ENDPOINT;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD;

const con = mysql.createConnection({
    host: DB_ENDPOINT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
});

module.exports = con;
