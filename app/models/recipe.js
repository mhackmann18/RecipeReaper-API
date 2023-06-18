/* eslint-disable no-plusplus */
/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
const connectToDB = require("./db");

class Recipe {
  static async create(newRecipe, result) {
    const conn = await connectToDB();

    await conn.beginTransaction();

    const query =
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

    try {
      await conn.execute(query, values);
      if (newRecipe.ingredients && newRecipe.ingredients.length) {
        await conn.execute(
          ...Recipe.createInsertIngredientsQuery(
            newRecipe.ingredients,
            newRecipe.id
          )
        );
      }
      if (newRecipe.instructions && newRecipe.instructions.length) {
        await conn.execute(
          ...Recipe.createInsertInstructionsQuery(
            newRecipe.instructions,
            newRecipe.id
          )
        );
      }
      if (newRecipe.nutrients && Object.keys(newRecipe.nutrients).length) {
        await conn.execute(
          ...Recipe.createInsertNutrientsQuery(
            newRecipe.nutrients,
            newRecipe.id
          )
        );
      }
      // create nutrients object
      conn.commit();
      result(null, newRecipe);
    } catch (err) {
      conn.rollback();
      result(err);
    } finally {
      conn.end();
    }
  }

  static createInsertInstructionsQuery(instructions, recipeId) {
    // Build sql query string
    let query = "INSERT INTO instructions (step, text, recipe_id) VALUES ";
    let values = [];

    for (let i = 0; i < instructions.length; i++) {
      if (!instructions[i].step || !instructions[i].text) {
        throw new Error("instruction fields 'step' and 'text' are required");
      }
      values = [
        ...values,
        instructions[i].step,
        instructions[i].text,
        recipeId,
      ];
      query += "(?, ?, ?)";
      query += i !== instructions.length - 1 ? ", " : ";";
    }

    return [query, values];
  }

  static createInsertIngredientsQuery(ingredients, recipeId) {
    // Build sql query string
    let query =
      "INSERT INTO ingredients (id, quantity, unit, name, recipe_id) VALUES ";
    let values = [];

    for (let i = 0; i < ingredients.length; i++) {
      const { quantity, unit, name, id } = ingredients[i];
      if (!quantity || !unit || !name || !id) {
        throw new Error(
          "ingredient fields 'id', 'quantity', 'unit', and 'name' are required"
        );
      }
      values = [...values, id, quantity, unit, name, recipeId];
      query += "(?, ?, ?, ?, ?)";
      query += i !== ingredients.length - 1 ? ", " : ";";
    }

    return [query, values];
  }

  static createInsertNutrientsQuery(nutrients, recipeId) {
    if (!nutrients) {
      throw new Error(
        "Cannot build query to insert nutrients. Parameter 'nutrients' must be an object."
      );
    }
    if (!Object.keys(nutrients).length) {
      throw new Error(
        "Cannot build query to insert nutrients. 'nutrients' argument object must contain at least one key value pair."
      );
    }
    // Build sql query string
    let query = "INSERT INTO nutrients (";
    const columnNames = [];
    const columnValues = [];

    for (const [name, value] of nutrients) {
      columnNames.push(name);
      columnValues.push(value);
    }

    for (let i = 0; i < ingredients.length; i++) {
      const { quantity, unit, name, id } = ingredients[i];
      if (!quantity || !unit || !name || !id) {
        throw new Error(
          "ingredient fields 'id', 'quantity', 'unit', and 'name' are required"
        );
      }
      values = [...values, id, quantity, unit, name, recipeId];
      query += "(?, ?, ?, ?, ?)";
      query += i !== ingredients.length - 1 ? ", " : ";";
    }

    return [query, values];
  }

  static async findById(id, result) {
    const conn = await connectToDB();

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
    WHERE r.id = ${conn.escape(id)}
    GROUP BY r.id`;

    try {
      const res = await conn.execute(query);
      result(null, res[0][0]);
    } catch (err) {
      result(err);
    } finally {
      conn.end();
    }
  }

  static async getAll(result) {
    const conn = await connectToDB();

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

    try {
      const res = await conn.execute(query);
      result(null, res[0]);
    } catch (err) {
      result(err);
    } finally {
      conn.end();
    }
  }

  static updateById(recipe, result) {
    connectToDB.query(
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
  //   connectToDB.query("DELETE FROM recipes WHERE id = ?", id, (err, res) => {
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
    connectToDB.beginTransaction(() => {
      const queries = `DELETE FROM ingredients WHERE recipe_id = ?; 
      DELETE FROM instructions WHERE recipe_id = ?;
      DELETE FROM nutrients WHERE recipe_id = ?;`;

      connectToDB.query(queries, [id, id, id], (error /* res */) => {
        if (error) {
          return connectToDB.rollback(() => {
            console.log("error: ", error);
            result(null, error);
          });
        }

        const query = "DELETE FROM recipes WHERE id = ?";
        connectToDB.query(query, id, (error, res) => {
          if (error) {
            return connectToDB.rollback(() => {
              console.log("error: ", error);
              result(null, error);
            });
          }

          if (res.affectedRows === 0) {
            // not found recipe with the id
            return connectToDB.rollback(() => {
              console.log("error: recipe doesn't exist");
              result({ kind: "not_found" }, null);
            });
          }

          connectToDB.commit((error) => {
            if (error) {
              return connectToDB.rollback(() => {
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
    connectToDB.query(
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
