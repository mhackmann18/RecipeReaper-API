const bcrypt = require("bcryptjs");
const utils = require("../utilities/utils");
const User = require("../models/User");

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
  console.log(hash);

  // const passwordHash = await bcrypt.hash(password, 10);

  User.create({ username, hash }, (err, user) => {
    if (err) {
      utils.printErrMsg(err);
      res.status(500).send({ message: err.message || "Some error occurred" });
    } else {
      utils.printSuccessMsg();
      res.send(user);
    }
  });
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
