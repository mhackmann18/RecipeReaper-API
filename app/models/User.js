const connectToDB = require("./db");

class User {
  #connection;

  async create(user) {
    const query = `INSERT INTO users SET ${this.#connection.escape(user)}`;

    await this.#connection.execute(query);

    const newUser = await this.findByUsername(user.username);

    return newUser;
  }

  async findByUsername(username) {
    const query = "SELECT * FROM users WHERE username = ?";

    const res = await this.#connection.execute(query, [username]);

    return res[0].length ? res[0][0] : null;
  }

  async findById(id) {
    const query = "SELECT * FROM users WHERE id = ?";

    const res = await this.#connection.execute(query, [id]);

    return res[0].length ? res[0][0] : null;
  }

  async findAll() {
    const query = "SELECT * FROM users";

    const res = await this.#connection.execute(query);

    return res[0];
  }

  async update(userData, id) {
    const query = `UPDATE users SET ${this.#connection.escape(
      userData
    )} WHERE id = ${this.#connection.escape(id)}`;

    await this.#connection.execute(query);

    const updatedUser = await this.findById(id);

    return updatedUser;
  }

  async deleteById(id) {
    const user = await this.findById(id);

    if (!user) {
      throw new Error(`No user found with id ${id}`, {
        cause: { code: 400 },
      });
    }

    const query = "DELETE FROM users WHERE id = ?";

    await this.#connection.execute(query, [id]);

    return user;
  }

  async openConnection() {
    this.#connection = await connectToDB();
  }

  closeConnection() {
    this.#connection?.end();
    this.#connection = null;
  }
}

module.exports = User;
