const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const utils = require("../utilities/utils");
require("dotenv").config({ path: `${__dirname}/config.env` });

const { requestWrapper } = utils;

exports.register = requestWrapper(async (req, user) => {
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

  const existingUser = await user.findOne(username);

  if (existingUser) {
    throw new Error("Username is already taken", { cause: { code: 400 } });
  }

  // Create user

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const newUser = await user.create({ username, password: hash });

  newUser.token = jwt.sign({ username }, process.env.TOKEN_KEY, {
    expiresIn: "2h",
  });

  return newUser;
});

exports.findOne = requestWrapper(async (req, user) => {
  const existingUser = await user.findOne(req.params.username);

  if (existingUser) return existingUser;

  throw new Error(`No user found with username '${req.params.username}'`, {
    cause: { code: 400 },
  });
});

exports.findAll = requestWrapper(async (req, user) => {
  const users = await user.findAll();

  return users;
});

exports.login = requestWrapper(async (req, user) => {
  // Validate request

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
    if (name !== "password" && name !== "username") {
      throw new Error(`Unknown property '${name}' provided`, {
        cause: { code: 400 },
      });
    }
  }

  // Make sure user exists

  const existingUser = await user.findOne(username);

  if (!existingUser) {
    throw new Error("No user exists with that username", {
      cause: { code: 400 },
    });
  }

  // Validate user password and login

  if (await bcrypt.compare(password, existingUser.password)) {
    existingUser.token = jwt.sign({ username }, process.env.TOKEN_KEY, {
      expiresIn: "2h",
    });

    return existingUser;
  }

  throw new Error("Incorrect password", { cause: { code: 400 } });
});

exports.update = requestWrapper((req, res) => {
  res.send({ message: "User updated" });
});

exports.delete = requestWrapper(async (req, user) => {
  const oldUser = await user.delete(req.params.username);

  return oldUser;
});
