const connectToDB = require("./db");

class User {
  #connection;

  async create({ username, password }) {
    const query = "INSERT INTO users SET username = ?, password = ?";

    await this.#connection.execute(query, [username, password]);

    return { username, password };
  }

  async findOne(username) {
    const query = "SELECT * FROM users WHERE username = ?";

    const res = await this.#connection.execute(query, [username]);

    return res[0].length ? res[0][0] : null;
  }

  async findAll() {
    const query = "SELECT * FROM users";

    const res = await this.#connection.execute(query);

    return res[0];
  }

  async update(oldUsername, user) {
    const query = `UPDATE users SET ${this.#connection.escape(
      user
    )} WHERE username = ${this.#connection.escape(oldUsername)}`;

    await this.#connection.execute(query, [user, oldUsername]);

    return user;
  }

  async delete(username) {
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

  async openConnection() {
    this.#connection = await connectToDB();
  }

  closeConnection() {
    this.#connection.end();
    this.#connection = null;
  }
}

module.exports = User;
