const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const access_token = req.headers.access_token;
    const decoded = jwt.verify(access_token, process.env.SECRET);
    // console.log(decoded, "<<<<<< salah token");
    req.decoded = decoded;
    next();
  } catch (err) {
    next({ name: "NOT_AUTHENTICATED", message: "Invalid User!" });
  }
};

module.exports = authenticate;
