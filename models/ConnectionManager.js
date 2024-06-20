/* 
Creating an connection instance to mySQL database.
*/
const mysql = require("mysql");
const DB_password = require("./Password_for_DB");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: DB_password,
  database: "heap2",
});

module.exports = con;
