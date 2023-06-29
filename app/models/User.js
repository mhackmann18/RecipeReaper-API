const connectToDB = require("./db");

class User {
  static async create({ username, password }) {
    const conn = await connectToDB();

    const query = "INSERT INTO users SET username = ?, password = ?";

    try {
      await conn.execute(query, [username, password]);
      return { user: { username, password } };
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

      return { user: res[0][0] };
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

  static async delete(username) {
    const conn = await connectToDB();

    const query = "DELETE FROM users WHERE username = ?";

    try {
      const response = await conn.execute(query, [username]);
      if (!response[0].affectedRows) {
        return {
          data: { message: `No user found with username '${username}'` },
        };
      }
      return {
        data: {
          message: `User with username '${username}' successfully deleted`,
        },
      };
    } catch (error) {
      return { error };
    } finally {
      conn.end();
    }
  }
}

module.exports = User;
