exports.printRequest = (req) => {
  console.log(`${req.method} ${req.url}`.yellow);
};

exports.printErrMsg = (err) => {
  console.log(`Error: ${err.message}`.red);
};

exports.printSuccessMsg = () => {
  console.log("Successfully completed request".green);
};
