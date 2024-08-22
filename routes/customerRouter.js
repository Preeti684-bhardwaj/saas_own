const express = require("express");
const router = express.Router();
const { customerSignup,getUserById,logOut,customerSignin,forgotPassword,resetPassword , freeTrial, sendOtp, emailOtpVerification, deleteUser, getUser } = require("../controllers/customerController");
const {
//   validateCreateCustomer,
  // validateSignup,
  validateSignin,
//   validateVerifyEmail,
//   validateUpdateCustomer,
//   validateFindOneCustomer,
//   validateDeleteCustomer,
//   validatePagination,
} = require("../utils/validation");
const {authenticate,authorize}=require('../middlewares/auth');

router.post("/signup",  customerSignup);
router.post("/signin", validateSignin, customerSignin);
router.post("/sendOtp",sendOtp)
router.get("/getUser/:userId",getUserById)
router.post("/emailVerification",emailOtpVerification)
router.post("/forgotpassword",forgotPassword);
router.post("/resetpassword/:token",resetPassword);
router.post('/logout',logOut)
router.get('/startTrial',authenticate,authorize(['CUSTOMER']),freeTrial);
router.get("/getUser", getUser);
router.get("/getUser/:userId",getUserById)
router.delete("/deleteuser",deleteUser);// authenticate,authorize(['ADMIN'])
// router.get("/verifyemail", validateVerifyEmail, customers.verifyEmail);
// router.put("/:id", validateUpdateCustomer, customers.update);
// router.get("/", validatePagination, customers.findAllPaginated);

module.exports = router;
