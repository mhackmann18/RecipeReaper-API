// const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  // Validate request

  if (!req.body) {
    res.status(400).send({ message: "Content cannot be empty" });
  }

  const { username, password } = req.body;

  if (!username) {
    res.status(400).send({ message: "'username' property is required" });
  }
  if (!password) {
    res.status(400).send({ message: "'password' property is required" });
  }
  for (const name of Object.keys(req.body)) {
    if (name !== "password" && name !== "username") {
      res.status(400).send({ message: `Unknown property '${name}' provided` });
    }
  }

  // Check if user already exists

  // const oldUser = await User.findOne({ username })

  const passwordHash = await bcrypt.hash(password);

  // Create user

  // const user = await User.create({ username, passwordHash });
};

exports.login = (req, res) => {
  res.send("user logged in");
};
