module.exports = (app) => {
  const users = require("../controllers/user");

  const router = require("express").Router();

  // Register a new user
  router.post("/register", users.register);

  // Login user
  router.post("/login", users.login);

  // Update info
  router.put("/:username", users.update);

  // Delete user
  router.delete("/:username", users.delete);

  app.use("/api/users", router);
};
