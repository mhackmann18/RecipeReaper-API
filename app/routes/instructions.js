module.exports = (app) => {
  const controller = require("../controllers/instructions");

  const router = require("express").Router();

  router.get("/:id");

  app.use("/api/recipes", router);
};
