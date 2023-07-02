const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (allowedAccessLevels) => (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const user = jwt.verify(token, config.TOKEN_KEY);
    req.user = user;

    // Only authorize the user if they have the correct accessLevel or if
    // they're dealing with their own resources
    if (
      !allowedAccessLevels.includes(user.accessLevel) &&
      req.params.username !== user.username
    ) {
      return res.status(403).send("Permission denied");
    }
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;
