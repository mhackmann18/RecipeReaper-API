const logRequest = (req, res, next) => {
  console.log(
    `Method: ${req.method.bold}  Endpoint: ${req.url.bold}  User: ${
      (req.user ? req.user.username : "none").bold
    }`.yellow
  );
  return next();
};

module.exports = logRequest;
