/* eslint-disable no-use-before-define */
const Recipe = require("../models/Recipe");
const { requestWrapper } = require("../utilities/utils");

// Create and Save a new recipe
exports.create = requestWrapper(Recipe, async (req, recipe) => {
  // Validate request
  if (!req.body || !Object.keys(req.body).length) {
    throw new Error("Content cannot be empty", { cause: { code: 400 } });
  }

  // Save recipe in the database
  const newRecipe = await recipe.create(req.body);

  return newRecipe;
});

// Retrieve all recipes
exports.findAll = requestWrapper(Recipe, async (req, recipe) => {
  const recipes = await recipe.findAll();

  return recipes;
});

// Find a single Recipe with a id
exports.findOne = requestWrapper(Recipe, async (req, res) => {
  Recipe.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.cause === "not_found") {
        res.status(404).send({
          message: `No recipe found with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: `Error retrieving recipe with id ${req.params.id}`,
        });
      }
    } else {
      res.send(data);
    }
  });
});

// Update a Recipe identified by the id in the request
exports.update = requestWrapper(Recipe, async (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  Recipe.updateById(req.body, req.params.id, (err, data) => {
    if (err) {
      if (err.cause === "not_found") {
        res.status(404).send({
          message: `No recipe found with id '${req.params.id}'.`,
        });
      } else {
        res.status(500).send({
          message: `Error updating recipe with id ${req.params.id}`,
        });
      }
    } else {
      res.send(data);
    }
  });
});

// Delete a Recipe with the specified id in the request
exports.delete = requestWrapper(Recipe, async (req, res) => {
  Recipe.remove(req.params.id, (err) => {
    if (err) {
      res.status(500).send({
        message: `Could not delete recipe with id ${req.params.id}`,
      });
    } else {
      res.send({ message: `Recipe was deleted successfully` });
    }
  });
});

// Delete all recipes from the database.
exports.deleteAll = requestWrapper(Recipe, async (req, res) => {
  Recipe.removeAll((err /* data */) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all recipes.",
      });
    } else {
      res.send({ message: `Successfully removed all recipes` });
    }
  });
});
