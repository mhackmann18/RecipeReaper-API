/* eslint-disable no-use-before-define */
const Recipe = require("../models/Recipe");
const { requestWrapper } = require("../utilities/utils");

// Create and Save a new recipe
exports.create = requestWrapper(Recipe, async (req, recipe) => {
  // Validate request
  if (!req.body || !Object.keys(req.body).length) {
    throw new Error("Content cannot be empty", { cause: { code: 400 } });
  }

  const newRecipe = await recipe.create(req.body);

  return newRecipe;
});

// Retrieve all recipes
exports.findAll = requestWrapper(Recipe, async (req, recipe) => {
  const recipes = await recipe.findAll();

  return recipes;
});

// Find a single Recipe with an id
exports.findOne = requestWrapper(Recipe, async (req, recipe) => {
  const existingRecipe = await recipe.findById(req.params.id);

  return existingRecipe;
});

// Update a Recipe identified by the id in the request
exports.update = requestWrapper(Recipe, async (req, recipe) => {
  // Validate Request
  if (!req.body) {
    throw new Error("Content cannot be empty", { cause: { code: 400 } });
  }

  const updatedRecipe = await recipe.updateById(req.body, req.params.id);

  return updatedRecipe;
});

// Delete a Recipe with the specified id in the request
exports.delete = requestWrapper(Recipe, async (req, recipe) => {
  const deletedRecipe = await recipe.remove(req.params.id);

  return deletedRecipe;
});

// Delete all recipes from the database.
exports.deleteAll = requestWrapper(Recipe, async (req, recipe) => {
  const data = await recipe.removeAll();

  return data;
});
