/* eslint-disable no-use-before-define */
const Recipe = require("../models/Recipe");
const { requestWrapper } = require("../utilities/utils");

const config = process.env;
const { NO_PERMISSION_ERR } = config;

// Create and Save a new recipe
exports.create = requestWrapper(Recipe, async (req, res, recipe) => {
  // Validate request

  if (!req.body || !Object.keys(req.body).length) {
    throw new Error("Content cannot be empty", { cause: { code: 400 } });
  }

  for (const columnName of Object.keys(req.body)) {
    if (
      ![
        "user_id",
        "title",
        "servings",
        "serving_size",
        "prep_time",
        "cook_time",
        "ingredients",
        "instructions",
        "nutrients",
        "original_url",
      ].includes(columnName)
    ) {
      throw new Error(`Unexpected property '${columnName}' provided`, {
        cause: { code: 400 },
      });
    }
  }

  const newRecipe = await recipe.create(req.body);

  return { data: newRecipe };
});

// Retrieve all recipes
exports.findAll = requestWrapper(Recipe, async (req, res, recipe) => {
  let recipes;

  if (req.user.username !== process.env.ADMIN_USERNAME) {
    recipes = await recipe.findByUser(req.user.id);
  } else {
    recipes = await recipe.findAll();
  }

  return { data: recipes };
});

// Find a single Recipe with an id
exports.findOne = requestWrapper(Recipe, async (req, res, recipe) => {
  // Validate request
  if (!(await recipe.isOwner(req.params.id, req.user.id))) {
    throw new Error("Permission denied: You are not the owner of this recipe", {
      cause: { code: 403, id: NO_PERMISSION_ERR },
    });
  }

  const existingRecipe = await recipe.findById(req.params.id);

  return { data: existingRecipe };
});

// Update a Recipe identified by the id in the request
exports.update = requestWrapper(Recipe, async (req, res, recipe) => {
  // Validate Request
  if (!req.body) {
    throw new Error("Content cannot be empty", { cause: { code: 400 } });
  }

  if (!(await recipe.isOwner(req.params.id, req.user.id))) {
    throw new Error("Permission denied: You are not the owner of this recipe", {
      cause: { code: 403, id: NO_PERMISSION_ERR },
    });
  }

  const updatedRecipe = await recipe.updateById(req.body, req.params.id);

  return { data: updatedRecipe };
});

// Delete a Recipe with the specified id in the request
exports.delete = requestWrapper(Recipe, async (req, res, recipe) => {
  // Validate request
  if (!(await recipe.isOwner(req.params.id, req.user.id))) {
    throw new Error("Permission denied: You are not the owner of this recipe", {
      cause: { code: 403, id: NO_PERMISSION_ERR },
    });
  }

  const deletedRecipe = await recipe.remove(req.params.id);

  return { data: deletedRecipe };
});

// Delete all recipes from the database.
exports.deleteAll = requestWrapper(Recipe, async (req, res, recipe) => {
  const data = await recipe.removeAll();

  return { data };
});
