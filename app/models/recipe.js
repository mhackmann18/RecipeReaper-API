/* eslint-disable no-plusplus */
/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
const connection = require("./db");

class Recipe {
  static create(newRecipe, result) {
    connection.beginTransaction((err) => {
      if (err) {
        result(err, null);
        return;
      }

      let sql =
        "INSERT INTO recipes SET id = ?, username = ?, title = ?, servings = ?, serving_size = ?, prep_time = ?, cook_time = ?";

      const values = [
        newRecipe.id,
        newRecipe.username,
        newRecipe.title,
        newRecipe.servings,
        newRecipe.serving_size,
        newRecipe.prep_time,
        newRecipe.cook_time,
        newRecipe.ingredients,
      ];

      connection.query(sql, values, (err /* res */) => {
        if (err) {
          return connection.rollback(() => {
            console.log("error: ", err.sqlMessage);
            result(err, null);
          });
        }

        sql =
          "INSERT INTO ingredients (id, recipe_id, quantity, unit, name) VALUES ";

        let values = [];

        for (let i = 0; i < newRecipe.ingredients.length; i++) {
          sql += "(?, ?, ?, ?, ?)";
          sql += i !== newRecipe.ingredients.length - 1 ? ", " : ";";
          values = [
            ...values,
            newRecipe.ingredients[i].id,
            newRecipe.id,
            newRecipe.ingredients[i].quantity,
            newRecipe.ingredients[i].unit,
            newRecipe.ingredients[i].name,
          ];
        }

        connection.query(sql, values, async (err /* res */) => {
          if (err) {
            return connection.rollback(() => {
              console.log("error: ", err.sqlMessage);
              result(err, null);
            });
          }

          const instructions = newRecipe.instructions
            ? await Recipe.addInstructions(newRecipe.instructions, newRecipe.id)
            : null;

          if (instructions) {
            return connection.rollback(() => {
              console.log("error");
              // result(err, null);
            });
          }

          connection.commit((error) => {
            if (error) {
              return connection.rollback(() => {
                console.log("error: ", error);
                result(null, error);
              });
            }

            console.log(
              `created new recipe '${newRecipe.title}' with id: ${newRecipe.id}`
            );
            result(null /* res */);
          });
        });
      });
    });
  }

  static addInstructions(instructions, recipeId) {
    let sql = "INSERT INTO instructions (step, text, recipe_id) VALUES ";
    let values = [];

    for (let i = 0; i < instructions.length; i++) {
      if (!instructions[i].step || !instructions[i].text) {
        return new Promise((resolve, reject) => {
          reject(new Error("sdDFSJKDSFJDFK"));
        });
      }
      values = [
        ...values,
        instructions[i].step,
        instructions[i].text,
        recipeId,
      ];
      sql += "(?, ?, ?)";
      sql += i !== instructions.length - 1 ? ", " : ";";
    }

    return new Promise((resolve, reject) => {
      connection.query(sql, values, (error, results) => {
        if (error) {
          console.log("error: ", error.sqlMessage);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  static findById(id, result) {
    const query = `SELECT r.*, 
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', i.id, 'name', i.name, 'unit', i.unit, 'quantity', i.quantity))
      FROM ingredients AS i
      WHERE i.recipe_id = r.id
      GROUP BY i.recipe_id) AS ingredients,
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('text', instr.text, 'step', instr.step))
      FROM instructions AS instr
      WHERE instr.recipe_id = r.id
      GROUP BY instr.recipe_id) AS instructions,
    (SELECT JSON_OBJECT('calories', n.calories, 'fat', n.fat, 'carbohydrate', n.carbohydrate)
      FROM nutrients AS n
      WHERE n.recipe_id = r.id
      GROUP BY n.recipe_id) AS nutrients
    FROM recipes AS r
    LEFT JOIN ingredients AS i ON r.id = i.recipe_id
    WHERE r.id = ${connection.escape(id)}
    GROUP BY r.id`;

    connection.query(query, (err, res) => {
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

      // not found recipe with the id
      result({ kind: "not_found" }, null);
    });
  }

  static getAll(result) {
    const query = `SELECT r.*, 
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', i.id, 'name', i.name, 'unit', i.unit, 'quantity', i.quantity))
      FROM ingredients AS i
      WHERE i.recipe_id = r.id
      GROUP BY i.recipe_id) AS ingredients,
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('text', instr.text, 'step', instr.step))
      FROM instructions AS instr
      WHERE instr.recipe_id = r.id
      GROUP BY instr.recipe_id) AS instructions,
    (SELECT JSON_OBJECT('calories', n.calories, 'fat', n.fat, 'carbohydrate', n.carbohydrate)
      FROM nutrients AS n
      WHERE n.recipe_id = r.id
      GROUP BY n.recipe_id) AS nutrients
    FROM recipes AS r
    LEFT JOIN ingredients AS i ON r.id = i.recipe_id
    GROUP BY r.id`;

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

  // static remove(id, result) {
  //   connection.query("DELETE FROM recipes WHERE id = ?", id, (err, res) => {
  //     if (err) {
  //       console.log("error: ", err);
  //       result(null, err);
  //       return;
  //     }

  //     if (res.affectedRows === 0) {
  //       // not found recipe with the id
  //       result({ kind: "not_found" }, null);
  //       return;
  //     }

  //     console.log("deleted recipe with id: ", id);
  //     result(null, res);
  //   });
  // }

  static remove(id, result) {
    connection.beginTransaction(() => {
      const queries = `DELETE FROM ingredients WHERE recipe_id = ?; 
      DELETE FROM instructions WHERE recipe_id = ?;
      DELETE FROM nutrients WHERE recipe_id = ?;`;

      connection.query(queries, [id, id, id], (error /* res */) => {
        if (error) {
          return connection.rollback(() => {
            console.log("error: ", error);
            result(null, error);
          });
        }

        const query = "DELETE FROM recipes WHERE id = ?";
        connection.query(query, id, (error, res) => {
          if (error) {
            return connection.rollback(() => {
              console.log("error: ", error);
              result(null, error);
            });
          }

          if (res.affectedRows === 0) {
            // not found recipe with the id
            return connection.rollback(() => {
              console.log("error: recipe doesn't exist");
              result({ kind: "not_found" }, null);
            });
          }

          connection.commit((error) => {
            if (error) {
              return connection.rollback(() => {
                console.log("error: ", error);
                result(null, error);
              });
            }

            console.log("deleted recipe with id: ", id);
            result(null, res);
          });
        });
      });
    });
  }

  static removeAll(result) {
    connection.query(
      "DELETE FROM ingredients; DELETE FROM instructions; DELETE FROM nutrients; DELETE FROM recipes;",
      (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }

        console.log(`deleted ${res.affectedRows} recipes`);
        result(null, res);
      }
    );
  }
}

module.exports = Recipe;
