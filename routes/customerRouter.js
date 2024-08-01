const express = require("express");
const router = express.Router();
const { customerSignup,getUserById,customerSignin,forgotPassword,resetPassword , freeTrial, sendOtp, emailOtpVerification } = require("../controllers/customerController");
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
router.post("/sendOtp",sendOtp)
router.get("/getUser/:userId",getUserById)
router.post("/emailVerification",emailOtpVerification)
router.post("/forgotpassword",forgotPassword);
router.post("/resetpassword/:token",resetPassword);
router.get('/startTrial',authenticate,authorize(['CUSTOMER']),freeTrial);
// router.get("/verifyemail", validateVerifyEmail, customers.verifyEmail);
// router.get("/:id", validateFindOneCustomer, customers.findOne);
// router.put("/:id", validateUpdateCustomer, customers.update);
// router.delete("/:id", validateDeleteCustomer, customers.delete);
// router.get("/", validatePagination, customers.findAllPaginated);

module.exports = router;
