const User = require("../models/User");

exports.printRequest = (req) => {
  console.log(`${req.method} ${req.url}`.yellow);
};

exports.printErrMsg = (err) => {
  console.log(`Error: ${err.message}`.red);
};

exports.printSuccessMsg = () => {
  console.log("Successfully completed request".green);
};

exports.requestWrapper = (fn) => async (req, res) => {
  const user = new User();

  try {
    await user.openConnection();
    console.log(`${req.method} ${req.url}`.yellow);
    const data = await fn(req, user);
    res.send(data);
    console.log("Successfully completed request".green);
  } catch (error) {
    res
      .status((error.cause && error.cause.code) || 500)
      .send({ message: error.message || "An unexpected error occurred" });
    console.log(`Error: ${error.message}`.red);
  } finally {
    user.closeConnection();
  }
};
