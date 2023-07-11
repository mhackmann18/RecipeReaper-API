const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const { printErrMsg } = require("../utilities/utils");

const config = process.env;

const verifyToken = (checkPrivilegesFn) => (req, res, next) => {
  try {
    const token = req.headers.cookie && cookie.parse(req.headers.cookie).token;

    if (!token) {
      printErrMsg({ message: "A token is required for authentication" });
      return res
        .status(403)
        .send({ message: "A token is required for authentication" });
    }

    const user = jwt.verify(token, config.TOKEN_KEY);
    req.user = user;

    if (
      !checkPrivilegesFn(req) &&
      user.username !== process.env.ADMIN_USERNAME
    ) {
      printErrMsg({ message: "Permission denied" });
      return res.status(403).send({ message: "Permission denied" });
    }
  } catch (error) {
    printErrMsg(error);
    return res.status(401).send({ message: "Invalid Token" });
  }
  return next();
};

exports.allowAllUsers = verifyToken(() => true);

exports.restrictAllUsers = verifyToken(() => false);

exports.allowUserWithSameId = verifyToken(
  (req) => req.user.id === Number(req.params.id)
);
