const express = require("express");
const router = express.Router();
const { customerSignup,customerSignin,forgotPassword,resetPassword , freeTrial } = require("../controllers/customerController");
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
const {authenticate,authorize}=require('../middlewares/auth');

router.post("/signup", validateSignup, customerSignup);
router.post("/signin", validateSignin, customerSignin);
router.post("/password/forgot",forgotPassword);
router.post("/password/reset/:customerId",resetPassword);
router.post('/startTrial',authenticate,authorize(['CUSTOMER']), freeTrial);
// router.get("/verifyemail", validateVerifyEmail, customers.verifyEmail);
// router.get("/:id", validateFindOneCustomer, customers.findOne);
// router.put("/:id", validateUpdateCustomer, customers.update);
// router.delete("/:id", validateDeleteCustomer, customers.delete);
// router.get("/", validatePagination, customers.findAllPaginated);

module.exports = router;
