const sql = require("./db");

class Ingredient {
  constructor(id, recipeId, quantity, unit, name) {
    this.id = id;
    this.recipeId = recipeId;
    this.quantity = quantity;
    this.unit = unit;
    this.name = name;
  }

  static create = (newIngredient, result) => {
    const { id, recipeId, quantity, unit, name } = newIngredient;

    sql.query(
      "INSERT INTO ingredients SET id = ?, recipe_id = ?, quantity = ?, unit = ?, name = ?",
      [id, recipeId, quantity, unit, name],
      (err /* res */) => {
        if (err) {
          console.log("error: ", err.sqlMessage);
          result(err, null);
          return;
        }

        // Add ingredients here

        console.log("Successfully created new ingredient");
        result(null, { ...newIngredient });
      }
    );
  };
}

module.exports = Ingredient;
