/* 
Creating an connection instance to mySQL database.
*/
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require("mysql");
const os = require('os');

const HOSTNAME = process.env.HOSTNAME;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER
let DB_PASSWORD = process.env.DB_PASSWORD;

if (os.platform() === 'win32') {
    DB_PASSWORD = '';  // Windows
} else if (os.platform() === 'darwin') {
    DB_PASSWORD = 'root';  // Mac
} else {
    // Add additional conditions for other operating systems if needed
    DB_PASSWORD = '';  // Default or other OS
}
const con = mysql.createConnection({
  host: HOSTNAME,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

module.exports = con;
