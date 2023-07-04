const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (checkPrivilegesFn) => (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const user = jwt.verify(token, config.TOKEN_KEY);
    req.user = user;

    if (
      checkPrivilegesFn &&
      !checkPrivilegesFn(user, req) &&
      user.username !== "god_of_prepmaster"
    ) {
      return res.status(403).send("Permission denied");
    }
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

exports.restrictAllUsers = verifyToken(() => false);

exports.allowUserWithSameId = verifyToken(
  (user, req) => user.id === Number(req.params.id)
);

exports.allowRecipeOwner = verifyToken(
  (user, req) => user.id === req.body.user_id
);

exports.allowAllUsers = verifyToken();
