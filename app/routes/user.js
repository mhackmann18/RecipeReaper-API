module.exports = (app) => {
  const users = require("../controllers/user");

  const router = require("express").Router();

  // Register a new user
  router.post("/", users.register);

  app.use("/api/users", router);
};
