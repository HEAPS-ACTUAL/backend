/*
The con.query function is orignally supposed to take in a callback function and execute it.
The purpose of this file is to change con.query into a function that returns the results of the SQL query directly instead of 
carrying out the callback function. This makes the function easier to deal with and results in neater code. 
*/

// const util = require('util');
// const pool = require('../models/ConnectionManager');

// const query = util.promisify(pool.query).bind(pool);

// module.exports = query;