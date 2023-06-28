const connectToDB = require("./db");

class User {
  static async create({ username, password }) {
    const conn = await connectToDB();

    const query = "INSERT INTO users SET username = ?, password = ?";

    try {
      const res = await conn.execute(query, [username, password]);
      return { user: res };
    } catch (error) {
      return { error };
    } finally {
      conn.end();
    }
  }
}

module.exports = User;
