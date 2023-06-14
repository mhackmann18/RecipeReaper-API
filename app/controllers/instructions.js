const Instructions = require("../models/Instructions");

exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty",
    });
  }

  // Save instructions in the database
  Instructions.create(req.body, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the recipe.",
      });
    } else {
      res.send(data);
    }
  });
};
