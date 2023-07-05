const { restrictAllUsers, allowAllUsers } = require("../middleware/auth");

module.exports = (app) => {
  const recipes = require("../controllers/recipe");

  const router = require("express").Router();

  // Create a new recipe
  router.post("/", allowAllUsers, recipes.create);

  // Get all recipes
  router.get("/", allowAllUsers, recipes.findAll);

  // Get a single recipe by its id
  // Controller method will send 403 if recipe isn't owned by the user
  router.get("/:id", allowAllUsers, recipes.findOne);

  // Update a recipe by its id
  // Controller method will send 403 if recipe isn't owned by the user
  router.put("/:id", allowAllUsers, recipes.update);

  // Delete a recipe by its id
  // Controller method will send 403 if recipe isn't owned by the user
  router.delete("/:id", allowAllUsers, recipes.delete);

  // Delete all recipes
  router.delete("/", restrictAllUsers, recipes.deleteAll);

  app.use("/api/recipes", router);
};
