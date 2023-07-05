const logRequest = (req, res, next) => {
  console.log(req);
  console.log(`${req.method} ${req.url}`.yellow);
  return next();
};

module.exports = logRequest;
