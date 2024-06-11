const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const { JWT_SECRET } = process.env;

//athentication

const authenticate = function (req, res, next) {
  try {
    let token = req.headers.authorization;
    token = token.replace("Bearer", "").trim();

    if (!token)
      return res
        .status(401)
        .send({ status: false, message: "Please provide token" });
    let decodedToken = jwt.verify(token, JWT_SECRET);
    req.decodedToken = decodedToken;
    console.log(req.decodedToken.obj.obj.id)
    next();
  } catch (error) {
    if (error.message == "Invalid token") {
      return res
        .status(401)
        .send({ status: false, message: "Enter valid token" });
    }
    return res.status(500).send({ status: false, message: error.message });
  }
};

//authorisation

const authorize = (roles = []) => {
  return [
    (req, res, next) => {
      console.log(req.decodedToken.obj.type);
      if (roles.length && !roles.includes(req.decodedToken.obj.type)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      next();
    },
  ];
};

module.exports = { authenticate, authorize };
