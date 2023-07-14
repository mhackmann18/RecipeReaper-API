const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const logRequest = (req, res, next) => {
  let user;
  try {
    const cookies = req.headers?.cookie && cookie.parse(req.headers.cookie);
    user =
      cookies?.access_token &&
      jwt.verify(cookies.access_token, process.env.ACCESS_TOKEN_KEY);
  } finally {
    console.log(
      `Method: ${req.method.bold}  Endpoint: ${req.url.bold}  User: ${
        (user ? user.username : "none").bold
      }`.yellow
    );
  }
  return next();
};

module.exports = logRequest;
