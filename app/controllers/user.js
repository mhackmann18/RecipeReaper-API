const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const utils = require("../utilities/utils");
const User = require("../models/User");
require("dotenv").config({ path: `${__dirname}/config.env` });

const { requestWrapper } = utils;

exports.register = requestWrapper(User, async (req, user) => {
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

exports.findOne = requestWrapper(User, async (req, user) => {
  const existingUser = await user.findOne(req.params.username);

  if (existingUser) return existingUser;

  throw new Error(`No user found with username '${req.params.username}'`, {
    cause: { code: 400 },
  });
});

exports.findAll = requestWrapper(User, async (req, user) => {
  const users = await user.findAll();

  return users;
});

exports.login = requestWrapper(User, async (req, user) => {
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

// Protected
exports.update = requestWrapper(User, async (req, db) => {
  const updatedUser = {};
  const oldUsername = req.params.username;
  const newUsername = req.body.username;
  const newPassword = req.body.password;

  // Validate request

  if (!req.body) {
    throw new Error("Content cannot be empty", { cause: { code: 400 } });
  }

  for (const name of Object.keys(req.body)) {
    if (name !== "password" && name !== "username" && name !== "theme") {
      throw new Error(`Unknown property '${name}' provided`, {
        cause: { code: 400 },
      });
    }
  }

  // Update theme

  if (req.body.theme) {
    updatedUser.theme = req.body.theme;
  }

  // Check that user with old username exists

  const oldUser = await db.findOne(oldUsername);

  if (!oldUser) {
    throw new Error(`No user found with the username '${oldUsername}'`, {
      cause: { code: 400 },
    });
  }

  // See if new username is available

  if (newUsername) {
    const existingUser = await db.findOne(newUsername);

    if (existingUser && existingUser.username !== oldUsername) {
      throw new Error("Username is already taken", { cause: { code: 400 } });
    }

    updatedUser.username = newUsername;
  }

  // Generate new password hash

  if (!(await bcrypt.compare(newPassword, oldUser.password))) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    updatedUser.password = passwordHash;
  }

  await db.update(req.params.username, updatedUser);

  // Get updated token

  if (newUsername) {
    updatedUser.token = jwt.sign({ newUsername }, process.env.TOKEN_KEY, {
      expiresIn: "2h",
    });
  }

  return updatedUser;
});

exports.delete = requestWrapper(User, async (req, user) => {
  const oldUser = await user.delete(req.params.username);

  return oldUser;
});
