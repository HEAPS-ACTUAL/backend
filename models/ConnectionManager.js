const mysql = require('mysql');
const util = require('util');

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "heap"
})

const query = util.promisify(con.query).bind(con);

module.exports = {con, query};