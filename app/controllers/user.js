const bcrypt = require("bcryptjs");
const utils = require("../utilities/utils");
const User = require("../models/User");

exports.findOne = async (req, res) => {
  utils.printRequest(req);

  const { user, error } = await User.findByUsername(req.params.username);

  if (user) {
    utils.printSuccessMsg();
    res.send(user);
  } else {
    utils.printErrMsg(error);
    res.status(500).send({ message: error || "An unexpected error occurred" });
  }
};

exports.findAll = async (req, res) => {
  utils.printRequest(req);

  const { users, error } = await User.findAll();

  if (users) {
    utils.printSuccessMsg();
    res.send(users);
  } else {
    utils.printErrMsg(error);
    res.status(500).send({ message: error || "An unexpected error occurred" });
  }
};

exports.register = async (req, res) => {
  utils.printRequest(req);

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

  // Create user

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const { user, error } = await User.create({ username, password: hash });

  if (error) {
    utils.printErrMsg(error);
    res.status(500).send({ message: error.message || "Some error occurred" });
  } else {
    utils.printSuccessMsg();
    res.send(user);
  }
};

exports.login = (req, res) => {
  res.send("user logged in");
};

exports.update = (req, res) => {
  res.send({ message: "User updated" });
};

exports.delete = (req, res) => {
  res.send({ message: "user updated" });
};
