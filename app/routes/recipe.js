module.exports = (app) => {
  const recipes = require("../controllers/recipe");

  const router = require("express").Router();

  // Create a new recipe
  router.post("/", recipes.create);

  // Get all recipes
  router.get("/", recipes.findAll);

  // Get a single recipe by its id
  router.get("/:id", recipes.findOne);

  // Update a recipe by its id
  // router.put("/:id", recipes.update);

  // Delete a recipe by its id
  router.delete("/:id", recipes.delete);

  // Delete all recipes
  router.delete("/", recipes.deleteAll);

  app.use("/api/recipes", router);
};
