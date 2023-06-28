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

  static async findOne(username) {
    const conn = await connectToDB();

    const query = "SELECT * FROM users WHERE username = ?";

    try {
      const res = await conn.execute(query, [username]);
      return { user: res[0] };
    } catch (error) {
      return { error };
    } finally {
      conn.end();
    }
  }

  static async findAll() {
    const conn = await connectToDB();

    const query = "SELECT * FROM users";

    try {
      const res = await conn.execute(query);
      return { users: res[0] };
    } catch (error) {
      return { error };
    } finally {
      conn.end();
    }
  }
}

module.exports = User;
