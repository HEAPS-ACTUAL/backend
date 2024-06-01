const util = require('util');
const con = require('../models/ConnectionManager');

const query = util.promisify(con.query).bind(con);

module.exports = query;