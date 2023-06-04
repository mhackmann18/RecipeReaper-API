const sql = require("./db.js");

// constructor
const Recipe = function(recipe) {
  this.id = recipe.id;
  this.username = recipe.username;
  this.title = recipe.title;
  this.servings = recipe.servings;
  this.servingSize = recipe.servingSize;
  this.prepTime = recipe.prepTime;
  this.cookTime = recipe.cookTime;
};

Recipe.create = (newRecipe, result) => {
  sql.query("INSERT INTO Recipes SET ?", newRecipe, (err, res) => {
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
  sql.query(`SELECT * FROM Recipes WHERE id = ${id}`, (err, res) => {
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
  let query = "SELECT * FROM Recipes";

  if (title) {
    query += ` WHERE title LIKE '%${title}%'`;
  }

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("Recipes: ", res);
    result(null, res);
  });
};

Recipe.updateById = (id, tutorial, result) => {
  sql.query(
    "UPDATE Recipes SET title = ?, description = ?, published = ? WHERE id = ?",
    [tutorial.title, tutorial.description, tutorial.published, id],
    (err, res) => {
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

      console.log("updated tutorial: ", { id: id, ...tutorial });
      result(null, { id: id, ...tutorial });
    }
  );
};

Recipe.remove = (id, result) => {
  sql.query("DELETE FROM Recipes WHERE id = ?", id, (err, res) => {
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

    console.log("deleted tutorial with id: ", id);
    result(null, res);
  });
};

Recipe.removeAll = result => {
  sql.query("DELETE FROM Recipes", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} Recipes`);
    result(null, res);
  });
};

module.exports = Recipe;
