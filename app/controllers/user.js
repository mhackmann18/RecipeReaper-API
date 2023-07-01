const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const utils = require("../utilities/utils");
const User = require("../models/User");
require("dotenv").config({ path: `${__dirname}/config.env` });

const requestWrapper = (fn) => async (req, res) => {
  let user;

  try {
    user = new User();
    utils.printRequest(req);
    const data = await fn(req, user);
    res.send(data);
    utils.printSuccessMsg();
  } catch (error) {
    res
      .status((error.cause && error.cause.code) || 500)
      .send({ message: error.message || "An unexpected error occurred" });
    utils.printErrMsg(error);
  } finally {
    user.closeConnection();
  }
};

exports.register = requestWrapper(async (req) => {
  if (!req.body) {
    throw new Error("Content cannot be empty", { cause: { code: 400 } });
  }

  const { username, password } = req.body;

  if (!username) {
    throw new Error("'username' property is required", {
      cause: { code: 400 },
    });
  }

  if (!password) {
    throw new Error("'password' property is required", {
      cause: { code: 400 },
    });
  }

  for (const name of Object.keys(req.body)) {
    if (name !== "password" && name !== "username" && name !== "theme") {
      throw new Error(`Unknown property '${name}' provided`, {
        cause: { code: 400 },
      });
    }
  }

  // Check if username already exists

  const existingUser = await User.findOne(username);

  if (existingUser.user) {
    throw new Error("Username is already taken", { cause: { code: 400 } });
  }

  // Create user

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const { user, error } = await User.create({ username, password: hash });

  if (error) {
    throw new Error(error.message || "Some error occurred");
  }

  user.token = jwt.sign({ username }, process.env.TOKEN_KEY, {
    expiresIn: "2h",
  });

  return user;
});

exports.findOne = requestWrapper(async (req) => {
  const { error, user } = await User.findOne(req.params.username);

  if (error) throw error;

  if (user) return user;

  throw new Error(`No user found with username '${req.params.username}'`, {
    cause: { code: 400 },
  });
});

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
