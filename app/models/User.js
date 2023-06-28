const connectToDB = require("./db");

class User {
  static async create({ username, password }, result) {
    const conn = await connectToDB();

    const query = "INSERT INTO users SET username = ?, password = ?";

    try {
      const res = await conn.execute(query, [username, password]);

      console.log(res);
      result(null, res);
    } catch (error) {
      result(error, null);
    } finally {
      conn.end();
    }
  }
}

module.exports = User;
