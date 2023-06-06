const connection = require("./db");

class Recipe {
  static create(newRecipe, result) {
    const sql =
      "INSERT INTO recipes SET id = ?, username = ?, title = ?, servings = ?, serving_size = ?, prep_time = ?, cook_time = ?";

    const values = [
      newRecipe.id,
      newRecipe.username,
      newRecipe.title,
      newRecipe.servings,
      newRecipe.serving_size,
      newRecipe.prep_time,
      newRecipe.cook_time,
    ];

    connection.query(sql, values, (err /* res */) => {
      if (err) {
        console.log("error: ", err.sqlMessage);
        result(err, null);
        return;
      }

      result(null, newRecipe);
    });
  }

  static findById(id, result) {
    connection.query(`SELECT * FROM recipes WHERE id = ${id}`, (err, res) => {
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
  }

  static getAll(title, result) {
    let query = "SELECT * FROM recipes";

    if (title) {
      query += ` WHERE title LIKE '%${title}%'`;
    }

    connection.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      console.log("recipes: ", res);
      result(null, res);
    });
  }

  static updateById(recipe, result) {
    connection.query(
      "UPDATE recipes SET title = ?, servings = ?, serving_size = ?, prep_time = ?, cook_time = ? WHERE id = ?",
      [
        recipe.title,
        recipe.servings,
        recipe.serving_size,
        recipe.prep_time,
        recipe.cook_time,
        recipe.id,
      ],
      (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }

        if (res.affectedRows === 0) {
          // not found Recipe with the id
          result({ kind: "not_found" }, null);
          return;
        }

        console.log("updated tutorial: ", { ...recipe });
        result(null, { ...recipe });
      }
    );
  }

  static remove(id, result) {
    connection.query("DELETE FROM recipes WHERE id = ?", id, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows === 0) {
        // not found Tutorial with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("deleted recipe with id: ", id);
      result(null, res);
    });
  }

  static removeAll(result) {
    connection.query("DELETE FROM recipes", (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      console.log(`deleted ${res.affectedRows} recipes`);
      result(null, res);
    });
  }
}

module.exports = Recipe;
