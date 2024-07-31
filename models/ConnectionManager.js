/* 
Creating an connection instance to mySQL database.
*/

// FOR .ENV FILE
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mysql = require("mysql2/promise");

const DB_ENDPOINT = process.env.DB_ENDPOINT;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD;

const pool = mysql.createPool({
    connectionLimit : 10,
    host: DB_ENDPOINT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    connectTimeout: 10000,
    queueLimit: 0,
    waitForConnections: true,
    idleTimeout: 300, // 28800 seconds = 8 hrs
    keepAliveInitialDelay: 10000, // if KeepAlive is true, this will be the initial delay
    enableKeepAlive: true // Enable keep-alive on the socket. (Default: true) 
});

// Function to execute a prepared statement
async function execute(queryString, queryArgs) {
    let connection;
    try {
        connection = await pool.getConnection(); // 
        // console.log("Successfully connected to DB!")
        const [results] = await connection.execute(queryString, queryArgs);
        // console.log(results)
        return results;
    } catch (err) {
        throw err;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Function to execute a query
async function query(queryString, queryArgs) {
    let connection;
    try {
        connection = await pool.getConnection(); // 
        // console.log("Successfully connected to DB!")
        const [results] = await connection.query(queryString, queryArgs);
        // console.log(results)
        return results;
    } catch (err) {
        throw err;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}


module.exports = {
    execute, query, pool
};
