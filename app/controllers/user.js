const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const utils = require("../utilities/utils");
const User = require("../models/User");
require("dotenv").config({ path: `${__dirname}/config.env` });

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
    if (name !== "password" && name !== "username" && name !== "theme") {
      res.status(400).send({ message: `Unknown property '${name}' provided` });
    }
  }

  // Check if user already exists

  const existingUser = await User.findOne(username);

  if (existingUser.user) {
    res.status(400).send({ message: "Username is already taken" });
    utils.printErrMsg({ message: "Username is already taken" });
    return;
  }

  // Create user

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const { user, error } = await User.create({ username, password: hash });

  if (error) {
    utils.printErrMsg(error);
    res
      .status(500)
      .send({ message: error.message.message || "Some error occurred" });
  } else {
    user.token = jwt.sign({ username }, process.env.TOKEN_KEY, {
      expiresIn: "2h",
    });
    utils.printSuccessMsg();
    res.send(user);
  }
};

exports.findOne = async (req, res) => {
  utils.printRequest(req);

  const { user, error } = await User.findOne(req.params.username);

  if (user) {
    utils.printSuccessMsg();
    res.send(user);
  } else if (error) {
    utils.printErrMsg(error);
    res.status(500).send({
      message: error.message.message || "An unexpected error occurred",
    });
  } else {
    utils.printErrMsg({
      message: `No user found with username '${req.params.username}'`,
    });
    res.status(400).send({
      message: `No user found with username '${req.params.username}'`,
    });
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
    res
      .status(500)
      .send({ message: error.message || "An unexpected error occurred" });
  }
};

exports.login = async (req, res) => {
  try {
    utils.printRequest(req);

    // Validate request

    if (!req.body) {
      throw new Error("Content cannot be empty");
    }

    const { username, password } = req.body;

    if (!username) {
      throw new Error("'username' property is required");
    }
    if (!password) {
      throw new Error("'password' property is required");
    }
    for (const name of Object.keys(req.body)) {
      if (name !== "password" && name !== "username") {
        throw new Error(`Unknown property '${name}' provided`);
      }
    }

    // Make sure user exists

    const existingUser = await User.findOne(username);

    if (!existingUser.user) {
      throw new Error("No user exists with that username");
    }

    if (await bcrypt.compare(password, existingUser.user.password)) {
      existingUser.user.token = jwt.sign({ username }, process.env.TOKEN_KEY, {
        expiresIn: "2h",
      });

      utils.printSuccessMsg();
      res.send(existingUser.user);
    } else {
      throw new Error("Incorrect password");
    }
  } catch (error) {
    utils.printErrMsg(error);
    res.status(500).send({ message: error.message || "Something went wrong" });
  }
};

exports.update = (req, res) => {
  res.send({ message: "User updated" });
};

exports.delete = async (req, res) => {
  utils.printRequest(req);

  const { data, error } = await User.delete(req.params.username);

  if (data) {
    utils.printSuccessMsg();
    res.send(data);
  } else {
    utils.printErrMsg(error);
    res
      .status(500)
      .send({ message: error.message || "An unexpected error occurred" });
  }
};
