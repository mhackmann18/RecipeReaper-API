const connection = require("./db");

class Instruction {
  static add(instructions, recipeId) {
    let sql = "INSERT INTO instructions (id, recipe_id, text) VALUES ";
    let values = [];

    for (let i = 0; i < instructions.length; i++) {
      sql += "(?, ?, ?)";
      sql += i !== instructions.length - 1 ? ", " : ";";
      values = [...values, instructions[i].id, recipeId, instructions[i].text];
    }

    return new Promise((resolve, reject) => {
      connection.query(sql, values, (error, results) => {
        if (error) {
          connection.rollback(() => {
            console.log("error: ", error.sqlMessage);
            reject(error);
          });
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = Instruction;
