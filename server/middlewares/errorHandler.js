const errHandler = function (err, req, res, next) {
  // console.log(err, " ini error dari errorhandler");
  let statusCode = 500;
  let errorCode = "UNKNOWN_ERROR";
  let message = "Internal server error";

  switch (true) {
    case err.name === "SequelizeValidationError":
      statusCode = 400;
      errorCode = "VALIDATION_ERROR";
      message = [];
      err.errors.forEach((el) => {
        message.push(el.message);
      });
      break;

    case err.name === "SequelizeUniqueConstraintError":
      statusCode = 400;
      errorCode = err.name;
      message = err.message;
      break;

    case err.name === "INVALID_DATA":
      statusCode = 400;
      errorCode = "VALIDATION_ERROR";
      message = err.message;
      break;

    case err.name === "NOT_AUTHENTICATED":
      statusCode = 401;
      errorCode = err.name;
      message = err.message;
      break;

    case err.name === "NOT_FOUND":
      statusCode = 404;
      errorCode = err.name;
      message = err.message;
      break;
  }
  res.status(statusCode).json({ error: errorCode, message });
};

module.exports = errHandler;
