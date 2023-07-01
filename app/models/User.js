const connectToDB = require("./db");

class User {
  #connection;

  constructor() {
    this.#connection = connectToDB();
  }

  async create({ username, password }) {
    const query = "INSERT INTO users SET username = ?, password = ?";

    await this.#connection.execute(query, [username, password]);

    return { username, password };
  }

  async findOne(username) {
    const query = "SELECT * FROM users WHERE username = ?";

    const res = await this.connection.execute(query, [username]);

    return res[0][0];
  }

  static async findAll() {
    const query = "SELECT * FROM users";

    const res = await this.#connection.execute(query);

    return res[0];
  }

  static async delete(username) {
    const query = "DELETE FROM users WHERE username = ?";

    const response = await this.#connection.execute(query, [username]);

    if (!response[0].affectedRows) {
      throw new Error(`No user found with username '${username}'`, {
        cause: { code: 400 },
      });
    }

    return {
      username,
    };
  }

  closeConnection() {
    this.#connection.end();
  }
}

module.exports = User;
