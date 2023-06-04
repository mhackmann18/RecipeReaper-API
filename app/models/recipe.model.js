const sql = require("./db.js");

// constructor
const Recipe = function(recipe) {
  this.id = recipe.id;
  this.username = recipe.username;
  this.title = recipe.title;
  this.servings = recipe.servings;
  this.serving_size = recipe.serving_size; 
  this.prep_time = recipe.prep_time;
  this.cook_time = recipe.cook_time;
};

Recipe.create = (newRecipe, result) => {
  sql.query("INSERT INTO recipes SET ?", newRecipe, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created recipe: ", { ...newRecipe });
    result(null, { ...newRecipe });
  });
};

Recipe.findById = (id, result) => {
  sql.query(`SELECT * FROM recipes WHERE id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found recipe: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Tutorial with the id
    result({ kind: "not_found" }, null);
  });
};

Recipe.getAll = (title, result) => {
  let query = "SELECT * FROM recipes";

  if (title) {
    query += ` WHERE title LIKE '%${title}%'`;
  }

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("recipes: ", res);
    result(null, res);
  });
};

Recipe.updateById = (recipe, result) => {

  sql.query(
    "UPDATE recipes SET title = ?, servings = ?, serving_size = ?, prep_time = ?, cook_time = ? WHERE id = ?",
    [recipe.title, recipe.servings, recipe.serving_size, recipe.prep_time, recipe.cook_time, recipe.id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Recipe with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated tutorial: ", { ...recipe });
      result(null, { ...recipe });
    }
  );
};

Recipe.remove = (id, result) => {
  sql.query("DELETE FROM recipes WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Tutorial with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted recipe with id: ", id);
    result(null, res);
  });
};

Recipe.removeAll = result => {
  sql.query("DELETE FROM recipes", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} recipes`);
    result(null, res);
  });
};

module.exports = Recipe;
