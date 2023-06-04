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
  const title = req.query.title;
  Recipe.getAll(title, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving recipes."
      });
    } else {
      res.send(data);
    }
  });
};

// Find a single Recipe with a id
exports.findOne = (req, res) => {
  Recipe.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found recipe with id ${req.params.id}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving recipe with id " + req.params.id
        });
      }
    } else res.send(data);
  });
};

// Update a Recipe identified by the id in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  console.log(req.body);

  Recipe.updateById(
    new Recipe(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found recipe with id ${req.params.recipe.id}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating recipe with id " + req.params.recipe.id
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a Recipe with the specified id in the request
exports.delete = (req, res) => {
  
};

// Delete all recipes from the database.
exports.deleteAll = (req, res) => {
  
};
