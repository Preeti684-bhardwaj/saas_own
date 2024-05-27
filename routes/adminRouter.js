const express = require("express");
const router = express.Router();
const { adminSignup,adminSignin,forgotPassword,resetPassword } = require("../controllers/adminController");
const {
//   validateCreateCustomer,
  validateSignup,
  validateSignin,
//   validateVerifyEmail,
//   validateUpdateCustomer,
//   validateFindOneCustomer,
//   validateDeleteCustomer,
//   validatePagination,
} = require("../utils/validation");

router.post("/signup", validateSignup, adminSignup);
router.post("/signin", validateSignin, adminSignin);
router.post("/password/forgot",forgotPassword)
router.post("/password/reset/:adminId",resetPassword)
// router.get("/verifyemail", validateVerifyEmail, customers.verifyEmail);
// router.get("/:id", validateFindOneCustomer, customers.findOne);
// router.put("/:id", validateUpdateCustomer, customers.update);
// router.delete("/:id", validateDeleteCustomer, customers.delete);
// router.get("/", validatePagination, customers.findAllPaginated);

module.exports = router;
