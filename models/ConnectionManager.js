/* 
Creating an connection instance to mySQL database.
*/
const mysql = require("mysql");
const os = require('os');

let DB_password = '';

if (os.platform() === 'win32') {
    DB_password = '';  // Windows
} else if (os.platform() === 'darwin') {
    DB_password = 'root';  // Mac
} else {
    // Add additional conditions for other operating systems if needed
    DB_password = '';  // Default or other OS
}
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: DB_password,
  database: "heap2",
});

module.exports = con;
