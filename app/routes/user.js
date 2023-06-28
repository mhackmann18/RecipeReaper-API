module.exports = (app) => {
  const users = require("../controllers/user");

  const router = require("express").Router();

  // Register a new user
  router.post("/register", users.register);

  // Login user
  router.post("/login", users.login);

  app.use("/api/users", router);
};
