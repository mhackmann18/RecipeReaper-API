// Starting code from https://www.bezkoder.com/node-js-rest-api-express-mysql/
require("colors");
require("dotenv").config({ path: `${__dirname}/config.env` });
const express = require("express");
const cors = require("cors");

const app = express();

const { PORT } = process.env;

const corsOptions = {
  origin: `http://localhost:${PORT + 1}`,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to PrepMaster" });
});

require("./app/routes/recipe")(app);
require("./app/routes/user")(app);

// set port, listen for requests
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
