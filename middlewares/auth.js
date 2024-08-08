const jwt = require("jsonwebtoken");
const db = require("../db/dbConnection.js");
const Customer = db.customers;
const dotenv = require("dotenv").config();
const { JWT_SECRET } = process.env;

//authentication
const authenticate = function (req, res, next) {
  try {
    const token = req.headers["authorization"];
    console.log(token);
    if (!token) {
      return res.status(401).send({ message: "No token provided." });
    }

    console.log("Token:", token);
    if (!token) {
      return res.status(401).send({ status: false, message: "Please provide token" });
    }

    let decodedToken = jwt.verify(token, JWT_SECRET);
    req.decodedToken = decodedToken;
    console.log("Decoded Token ID:", req.decodedToken.obj.obj.id);
    next();
  } catch (error) {
    if (error.message === "Invalid token") {
      return res.status(401).send({ status: false, message: "Enter valid token" });
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

// authenticate by api key 
const authenticateByApiKey = async(req, res, next)=> {
  try {
    let api_key = req.headers['x-api-key'];
    if (!api_key)
      return res
        .status(401)
        .send({ status: false, message: "Please provide api_key" });
    let existing_api_key = await Customer.findOne({ where: { api_key:api_key } });
    if(!existing_api_key){
      return res
        .status(401)
        .send({ status: false, message: "unauthorized" });
    }
    console.log(api_key)
    req.userApiKey=existing_api_key.api_key
    console.log("auth se hu",req.userApiKey);
    next();
  } catch (error) {
    // if (error.message) {
    //   return res
    //     .status(401)
    //     .send({ status: false, message: "Enter valid token" });
    // }
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { authenticate, authorize ,authenticateByApiKey};
