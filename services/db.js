const mysql = require('mysql');
const conn = mysql.createConnection({
 host: "localhost",
 user: "root",
 password: "ds89mg31",
 database: "Recipes",
});

conn.connect();

module.exports = conn;
