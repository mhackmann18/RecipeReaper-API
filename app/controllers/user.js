const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const utils = require("../utilities/utils");
const User = require("../models/User");
require("dotenv").config({ path: `${__dirname}/config.env` });

const { requestWrapper } = utils;

exports.getSelf = requestWrapper(User, async (req, res, user) => {
  const existingUser = await user.findById(req.user.id);

  if (existingUser) return existingUser;

  throw new Error(`No user found with id '${req.user.id}'`, {
    cause: { code: 400 },
  });
});

exports.register = requestWrapper(User, async (req, res, user) => {
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

  const existingUser = await user.findByUsername(username);

  if (existingUser) {
    throw new Error("Username is already taken", { cause: { code: 400 } });
  }

  // Create user

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const newUser = await user.create({ ...req.body, password: hash });

  const accessToken = jwt.sign(
    { username, id: newUser.id },
    process.env.ACCESS_TOKEN_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN * 1000 }
  );

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("access_token", accessToken, {
      maxAge: process.env.ACCESS_TOKEN_EXPIRES_IN,
      sameSite: "strict",
      path: "/",
      secure: true,
    })
  );

  return newUser;
});

exports.findOne = requestWrapper(User, async (req, res, user) => {
  const existingUser = await user.findById(req.params.id);

  if (existingUser) return existingUser;

  throw new Error(`No user found with id '${req.params.id}'`, {
    cause: { code: 400 },
  });
});

exports.findAll = requestWrapper(User, async (req, res, user) => {
  const users = await user.findAll();

  return users;
});

exports.login = requestWrapper(User, async (req, res, user) => {
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

  const existingUser = await user.findByUsername(username);

  if (!existingUser) {
    throw new Error("No user exists with that username", {
      cause: { code: 400 },
    });
  }

  // Validate user password and login

  if (await bcrypt.compare(password, existingUser.password)) {
    const accessToken = jwt.sign(
      { username, id: existingUser.id },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN * 1000 }
    );

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("access_token", accessToken, {
        maxAge: process.env.ACCESS_TOKEN_EXPIRES_IN,
        sameSite: "strict",
        path: "/",
        secure: true,
      })
    );

    return existingUser;
  }

  throw new Error("Incorrect password", { cause: { code: 400 } });
});

// Protected
exports.update = requestWrapper(User, async (req, res, db) => {
  const newUserData = {};
  const userId = req.params.id;
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
    newUserData.theme = req.body.theme;
  }

  // Check that user with old username exists

  const oldUser = await db.findById(userId);

  if (!oldUser) {
    throw new Error(`No user found with id '${userId}'`, {
      cause: { code: 400 },
    });
  }

  // See if new username is available

  if (newUsername) {
    const existingUser = await db.findByUsername(newUsername);

    if (existingUser && existingUser.username !== oldUser.username) {
      throw new Error("Username is already taken", { cause: { code: 400 } });
    }

    newUserData.username = newUsername;
  }

  // Generate new password hash

  if (newPassword && !(await bcrypt.compare(newPassword, oldUser.password))) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    newUserData.password = passwordHash;
  }

  let updatedUser;

  if (Object.keys(newUserData).length) {
    updatedUser = await db.update(newUserData, userId);
  } else {
    updatedUser = await db.findById(userId);
  }

  // Get updated token

  if (newUsername) {
    const token = jwt.sign(
      { username: newUsername, id: updatedUser.id },
      process.env.ACCESS_TOKEN_KEY,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN * 1000,
      }
    );

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("access_token", token, {
        maxAge: process.env.ACCESS_TOKEN_EXPIRES_IN,
        sameSite: "strict",
        path: "/",
        secure: true,
      })
    );
  }

  return updatedUser;
});

exports.delete = requestWrapper(User, async (req, res, user) => {
  const oldUser = await user.deleteById(req.params.id);

  return oldUser;
});
