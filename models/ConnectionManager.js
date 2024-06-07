/* 
Creating an connection instance to mySQL database.
*/
const mysql = require("mysql");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "heap",
});

module.exports = con;
