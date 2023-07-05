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
      !checkPrivilegesFn(req) &&
      user.username !== process.env.ADMIN_USERNAME
    ) {
      return res.status(403).send("Permission denied");
    }
  } catch (err) {
    console.log(err.message.red);
    return res.status(401).send("Invalid Token");
  }
  return next();
};

exports.allowAllUsers = verifyToken(() => true);

exports.restrictAllUsers = verifyToken(() => false);

exports.allowUserWithSameId = verifyToken(
  (req) => req.user.id === Number(req.params.id)
);

// exports.allowRecipeOwner = verifyToken(async (user, req) => {
//   const recipeId = req.params.id;
//   const userId = req.user.id;

//   const db = new Recipe();

//   try {
//     await db.openConnection();

//     const query = "SELECT * FROM recipes WHERE user_id = ? AND id = ?";

//     const res = await db.
//   } catch (error) {
//     throw new Error(error);
//   } finally {
//     db.closeConnection();
//   }
// });
