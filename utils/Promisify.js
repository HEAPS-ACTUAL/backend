const util = require('util');

const query = util.promisify(con.query).bind(con);

module.exports = query;