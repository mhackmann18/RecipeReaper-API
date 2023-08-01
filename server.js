// Starting code from https://www.bezkoder.com/node-js-rest-api-express-mysql/
require("colors");
require("dotenv").config({ path: `${__dirname}/config.env` });
const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const logRequest = require("./app/middleware/logRequest");

const app = express();

const { CORS_ORIGIN } = process.env;

const corsOptions = {
  origin: `${CORS_ORIGIN}`,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(logRequest);

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to RecipeReaper" });
});

require("./app/routes/recipe")(app);
require("./app/routes/user")(app);

const { PORT } = process.env;

const options = {
  key: fs.readFileSync("/etc/pki/tls/private/rrapi-tls.key"),
  cert: fs.readFileSync("/etc/pki/tls/certs/api_recipereaper_com.crt"),
};

// set port, listen for requests
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
