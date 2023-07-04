const auth = require("../middleware/auth");

const restrictAllUsers = () => false;

const allowUserWithSameId = (user, req) => user.id === Number(req.params.id);

module.exports = (app) => {
  const users = require("../controllers/user");

  const router = require("express").Router();

  // Get a single user
  router.get("/:id", auth(allowUserWithSameId), users.findOne);

  // Get all users
  router.get("/", auth(restrictAllUsers), users.findAll);

  // Register a new user
  router.post("/register", users.register);

  // Login user
  router.post("/login", users.login);

  // Update user info
  router.put("/:id", auth(allowUserWithSameId), users.update);

  // Delete user
  router.delete("/:id", auth(allowUserWithSameId), users.delete);

  app.use("/api/users", router);
};
