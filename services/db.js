const mysql = require('mysql');
const connectDB = mysql.createConnection({
 host: "localhost",
 user: "root",
 password: "ds89mg31",
 database: "Recipes",
});

connectDB.connect();

module.exports = connectDB;
