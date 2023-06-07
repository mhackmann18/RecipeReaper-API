module.exports = (app) => {
  const recipes = require("../controllers/recipe");

  const router = require("express").Router();

  // Create a new Tutorial
  router.post("/", recipes.create);

  // Retrieve all Tutorials
  router.get("/", recipes.findAll);

  // Retrieve a single Tutorial with id
  router.get("/:id", recipes.findOne);

  // Update a Tutorial with id
  router.put("/:id", recipes.update);

  // Delete a Tutorial with id
  router.delete("/:id", recipes.delete);

  // Delete all Tutorials
  router.delete("/", recipes.deleteAll);

  app.use("/api/recipes", router);
};
