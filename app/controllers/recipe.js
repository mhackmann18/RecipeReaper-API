/* eslint-disable no-use-before-define */
const recipeModel = require("../models/Recipe");

// Create and Save a new recipe
exports.create = (req, res) => {
  printRequest(req);

  // Validate request
  if (!req.body || !Object.keys(req.body).length) {
    printErrMsg(new Error("Request cannot be empty"));
    res.status(400).send({
      message: "Content can not be empty",
    });
  }

  // Save recipe in the database
  recipeModel.create(req.body, (err, data) => {
    if (err) {
      printErrMsg(err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the recipe.",
      });
    } else {
      printSuccessMsg();
      res.send(data);
    }
  });
};

// Retrieve all recipes
exports.findAll = (req, res) => {
  printRequest(req);

  recipeModel.getAll((err, data) => {
    if (err) {
      printErrMsg(err);
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving recipes.",
      });
    } else {
      printSuccessMsg();
      res.send(data);
    }
  });
};

// Find a single Recipe with a id
exports.findOne = (req, res) => {
  printRequest(req);

  recipeModel.findById(req.params.id, (err, data) => {
    if (err) {
      printErrMsg(err);
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found recipe with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: `Error retrieving recipe with id ${req.params.id}`,
        });
      }
    } else {
      printSuccessMsg();
      res.send(data);
    }
  });
};

// Update a Recipe identified by the id in the request
exports.update = (req, res) => {
  printRequest(req);

  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  recipeModel.updateById(req.body, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found recipe with id ${req.params.recipe.id}.`,
        });
      } else {
        res.status(500).send({
          message: `Error updating recipe with id ${req.params.recipe.id}`,
        });
      }
    } else res.send(data);
  });
};

// Delete a Recipe with the specified id in the request
exports.delete = (req, res) => {
  printRequest(req);

  recipeModel.remove(req.params.id, (err /* data */) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found recipe with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: `Could not delete recipe with id ${req.params.id}`,
        });
      }
    } else res.send({ message: `Recipe was deleted successfully!` });
  });
};

// Delete all recipes from the database.
exports.deleteAll = (req, res) => {
  printRequest(req);

  recipeModel.removeAll((err /* data */) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all recipes.",
      });
    else res.send({ message: `All recipes were deleted successfully!` });
  });
};

function printRequest(req) {
  console.log(`${req.method} ${req.url}`.yellow);
}

function printErrMsg(err) {
  console.log(`Error: ${err.message}`.red);
}

function printSuccessMsg() {
  console.log("Successfully completed request".green);
}
