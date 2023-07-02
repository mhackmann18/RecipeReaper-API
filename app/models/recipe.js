/* eslint-disable no-plusplus */
/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
const connectToDB = require("./db");

class Recipe {
  #connection;

  async create(newRecipe) {
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
      await this.#connection.beginTransaction();

      // Create recipe
      await this.#connection.execute(query, values);

      // Create ingredients
      if (newRecipe.ingredients && newRecipe.ingredients.length) {
        await this.#connection.execute(
          ...Recipe.createInsertIngredientsQuery(
            newRecipe.ingredients,
            newRecipe.id
          )
        );
      }

      // Create instructions
      if (newRecipe.instructions && newRecipe.instructions.length) {
        await this.#connection.execute(
          ...Recipe.createInsertInstructionsQuery(
            newRecipe.instructions,
            newRecipe.id
          )
        );
      }

      // Create nutrients
      if (newRecipe.nutrients && Object.keys(newRecipe.nutrients).length) {
        await this.#connection.execute(
          ...Recipe.createInsertNutrientsQuery(
            newRecipe.nutrients,
            newRecipe.id
          )
        );
      }

      await this.#connection.commit();

      return newRecipe;
    } catch (error) {
      await this.#connection.rollback();
      throw error;
    }
  }

  async findById(id) {
    const query = `SELECT r.*, 
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', i.id, 'name', i.name, 'unit', i.unit, 'quantity', i.quantity))
      FROM ingredients AS i
      WHERE i.recipe_id = r.id
      GROUP BY i.recipe_id) AS ingredients,
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('text', instr.text, 'step', instr.step))
      FROM instructions AS instr
      WHERE instr.recipe_id = r.id
      GROUP BY instr.recipe_id) AS instructions,
    (SELECT JSON_OBJECT(
    'calories', n.calories,
    'fat', n.fat,
    'saturated_fat', n.saturated_fat,
    'unsaturated_fat', n.unsaturated_fat,
    'trans_fat', n.trans_fat,
    'carbohydrate', n.carbohydrate,
    'protein', n.protein,
    'sugar', n.sugar,
    'cholesterol', n.cholesterol,
    'sodium', n.sodium,
    'fiber', n.fiber)
      FROM nutrients AS n
      WHERE n.recipe_id = r.id
      GROUP BY n.recipe_id) AS nutrients
    FROM recipes AS r
    LEFT JOIN ingredients AS i ON r.id = i.recipe_id
    WHERE r.id = ${this.#connection.escape(id)}
    GROUP BY r.id`;

    const res = await this.#connection.execute(query);

    if (!res[0][0]) {
      throw new Error(`Recipe with id '${id}' doesn't exist`, {
        cause: { code: 400 },
      });
    }

    return res[0][0];
  }

  async getAll() {
    const query = `SELECT r.*, 
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', i.id, 'name', i.name, 'unit', i.unit, 'quantity', i.quantity))
      FROM ingredients AS i
      WHERE i.recipe_id = r.id
      GROUP BY i.recipe_id) AS ingredients,
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('text', instr.text, 'step', instr.step))
      FROM instructions AS instr
      WHERE instr.recipe_id = r.id
      GROUP BY instr.recipe_id) AS instructions,
    (SELECT JSON_OBJECT(
    'calories', n.calories,
    'fat', n.fat,
    'saturated_fat', n.saturated_fat,
    'unsaturated_fat', n.unsaturated_fat,
    'trans_fat', n.trans_fat,
    'carbohydrate', n.carbohydrate,
    'protein', n.protein,
    'sugar', n.sugar,
    'cholesterol', n.cholesterol,
    'sodium', n.sodium,
    'fiber', n.fiber)
      FROM nutrients AS n
      WHERE n.recipe_id = r.id
      GROUP BY n.recipe_id) AS nutrients
    FROM recipes AS r
    LEFT JOIN ingredients AS i ON r.id = i.recipe_id
    GROUP BY r.id`;

    const res = await this.#connection.execute(query);

    return res[0];
  }

  async updateById(recipe, id) {
    const query =
      "UPDATE recipes SET username = ?, title = ?, servings = ?, serving_size = ?, prep_time = ?, cook_time = ? WHERE id = ?";

    const values = [
      recipe.username,
      recipe.title,
      recipe.servings,
      recipe.serving_size,
      recipe.prep_time,
      recipe.cook_time,
      id,
    ];

    try {
      await this.#connection.beginTransaction();

      // Update recipe
      const res = await this.#connection.execute(query, values);

      if (!res[0].affectedRows) {
        throw new Error(`Recipe with id '${id}' doesn't exist`, {
          cause: { code: 400 },
        });
      }

      // Update ingredients
      await this.#connection.execute(
        "DELETE FROM ingredients WHERE recipe_id = ?",
        [id]
      );

      if (recipe.ingredients && recipe.ingredients.length) {
        await this.#connection.execute(
          ...Recipe.createInsertIngredientsQuery(recipe.ingredients, id)
        );
      }

      // Update instructions
      await this.#connection.execute(
        "DELETE FROM instructions WHERE recipe_id = ?",
        [id]
      );

      if (recipe.instructions && recipe.instructions.length) {
        await this.#connection.execute(
          ...Recipe.createInsertInstructionsQuery(recipe.instructions, id)
        );
      }

      // Update nutrients
      await this.#connection.execute(
        "DELETE FROM nutrients WHERE recipe_id = ?",
        [id]
      );

      if (recipe.nutrients && Object.keys(recipe.nutrients).length) {
        await this.#connection.execute(
          ...Recipe.createInsertNutrientsQuery(recipe.nutrients, id)
        );
      }

      await this.#connection.commit();

      return recipe;
    } catch (err) {
      await this.#connection.rollback();
      throw err;
    }
  }

  async remove(id) {
    const query = "DELETE FROM recipes WHERE id = ?";
    const res = await this.#connection.execute(query, [id]);

    if (!res[0].affectedRows) {
      throw new Error(`Recipe with id '${id}' doesn't exist`);
    }

    return { id };
  }

  async removeAll() {
    const query = "DELETE FROM recipes";
    const res = await this.#connection.execute(query);

    if (!res[0].affectedRows) {
      throw new Error(`There are no recipes to delete`);
    }

    return { message: "Successfully removed all recipes" };
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

    return [query, columnValues];
  }

  openConnection() {
    this.#connection = connectToDB();
  }

  closeConnection() {
    this.#connection = connectToDB();
  }
}

module.exports = Recipe;
