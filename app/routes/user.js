const { allowUserWithSameId, restrictAllUsers } = require("../middleware/auth");

module.exports = (app) => {
  const users = require("../controllers/user");

  const router = require("express").Router();

  // Get a single user
  router.get("/:id", allowUserWithSameId, users.findOne);

  // Get all users
  router.get("/", restrictAllUsers, users.findAll);

  // Register a new user
  router.post("/register", users.register);

  // Login user
  router.post("/login", users.login);

  // Update user info
  router.put("/:id", allowUserWithSameId, users.update);

  // Delete user
  router.delete("/:id", allowUserWithSameId, users.delete);

  app.use("/api/users", router);
};
