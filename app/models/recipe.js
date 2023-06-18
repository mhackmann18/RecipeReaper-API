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
      // Create recipe
      await conn.execute(query, values);

      // Create ingredients
      if (newRecipe.ingredients && newRecipe.ingredients.length) {
        await conn.execute(
          ...Recipe.createInsertIngredientsQuery(
            newRecipe.ingredients,
            newRecipe.id
          )
        );
      }

      // Create instructions
      if (newRecipe.instructions && newRecipe.instructions.length) {
        await conn.execute(
          ...Recipe.createInsertInstructionsQuery(
            newRecipe.instructions,
            newRecipe.id
          )
        );
      }

      // Create nutrients
      if (newRecipe.nutrients && Object.keys(newRecipe.nutrients).length) {
        await conn.execute(
          ...Recipe.createInsertNutrientsQuery(
            newRecipe.nutrients,
            newRecipe.id
          )
        );
      }

      await conn.commit();
      result(null, newRecipe);
    } catch (err) {
      await conn.rollback();
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
    const columnNames = ["recipe_id"];
    const columnValues = [recipeId];

    for (const [name, value] of Object.entries(nutrients)) {
      columnNames.push(name);
      columnValues.push(value);
    }

    for (let i = 0; i < columnNames.length; i++) {
      query +=
        i !== columnNames.length - 1
          ? `${columnNames[i]}, `
          : `${columnNames[i]}) `;
    }

    query += `VALUES (`;

    for (let i = 0; i < columnValues.length; i++) {
      query += i !== columnValues.length - 1 ? `?, ` : `?);`;
    }

    console.log(query);

    return [query, columnValues];
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

  static async updateById(recipe, result) {
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

  static async remove(id, result) {
    const conn = await connectToDB();

    await conn.beginTransaction();

    try {
      let query = "DELETE FROM ingredients WHERE recipe_id = ?";
      await conn.execute(query, [id]);

      query = "DELETE FROM instructions WHERE recipe_id = ?";
      await conn.execute(query, [id]);

      query = "DELETE FROM nutrients WHERE recipe_id = ?";
      await conn.execute(query, [id]);

      query = "DELETE FROM recipes WHERE id = ?";
      const res = await conn.execute(query, [id]);

      if (!res[0].affectedRows) {
        throw new Error(`Recipe with id '${id}' doesn't exist`);
      }

      await conn.commit();
      result();
    } catch (err) {
      await conn.rollback();
      result(err);
    } finally {
      conn.end();
    }
  }

  static async removeAll(result) {
    const conn = await connectToDB();

    await conn.beginTransaction();

    try {
      let query = "DELETE FROM ingredients";
      await conn.execute(query);

      query = "DELETE FROM instructions";
      await conn.execute(query);

      query = "DELETE FROM nutrients";
      await conn.execute(query);

      query = "DELETE FROM recipes";
      const res = await conn.execute(query);

      if (!res[0].affectedRows) {
        throw new Error(`There are no recipes to delete`);
      }

      await conn.commit();
      result();
    } catch (err) {
      await conn.rollback();
      result(err);
    } finally {
      conn.end();
    }
  }
}

module.exports = Recipe;
