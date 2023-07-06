// Starting code from https://www.bezkoder.com/node-js-rest-api-express-mysql/
require("colors");
require("dotenv").config({ path: `${__dirname}/config.env` });
const express = require("express");
const cors = require("cors");
const logRequest = require("./app/middleware/logRequest");

const app = express();

const { CORS_ORIGIN, PORT } = process.env;

const corsOptions = {
  origin: `http://localhost:${CORS_ORIGIN}`,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(logRequest);

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
