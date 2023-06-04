const Recipe = require("../models/recipe.model.js");

// Create and Save a new recipe
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const { id, username, title, servings, serving_size, prep_time, cook_time } = req.body;

  // Create a recipe
  const recipe = new Recipe({
    id, username, title, servings, serving_size, prep_time, cook_time
  });

  // Save recipe in the database
  Recipe.create(recipe, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the recipe."
      });
    else res.send(data);
  });
};

// Retrieve all recipes from the database (with condition).
exports.findAll = (req, res) => {
  
};

// Find a single Recipe with a id
exports.findOne = (req, res) => {
  
};

// Update a Recipe identified by the id in the request
exports.update = (req, res) => {
  
};

// Delete a Recipe with the specified id in the request
exports.delete = (req, res) => {
  
};

// Delete all recipes from the database.
exports.deleteAll = (req, res) => {
  
};
