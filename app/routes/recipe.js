const {
  restrictAllUsers,
  allowUserWithSameId,
  allowAllUsers,
} = require("../middleware/auth");

module.exports = (app) => {
  const recipes = require("../controllers/recipe");

  const router = require("express").Router();

  // Create a new recipe
  router.post("/", allowAllUsers, recipes.create);

  // Get all recipes
  router.get("/", restrictAllUsers, recipes.findAll);

  // Get a single recipe by its id
  router.get("/:id", allowUserWithSameId, recipes.findOne);

  // Update a recipe by its id
  router.put("/:id", allowUserWithSameId, recipes.update);

  // Delete a recipe by its id
  router.delete("/:id", allowUserWithSameId, recipes.delete);

  // Delete all recipes
  router.delete("/", restrictAllUsers, recipes.deleteAll);

  app.use("/api/recipes", router);
};
