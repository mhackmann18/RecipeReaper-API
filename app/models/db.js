const mysql = require("mysql2/promise");

// Create a connection to the database
module.exports = async function () {
  const conn = await mysql.createConnection({
    host: process.env.HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    multipleStatements: true,
  });

  return conn;
};
