const moment = require("moment");
const validator = require("validator");
// const PASSWORD_REGEX =
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Get today's date
const today = moment();

// ------------------customer validation----------------------------------------------------------------
const { body, param, query } = require("express-validator");

const validateSignup = [
  body("email").isEmail().withMessage("Must be a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Must be a valid phone number"),
];

const validateSignin = [
  body("email").isEmail().withMessage("Must be a valid email address"),
  body("password").exists().withMessage("Password is required"),
];

const validateVerifyEmail = [
  query("token").exists().withMessage("Token is required"),
];
const validateUpdateCustomer = [
  param("id").isUUID().withMessage("Must be a valid UUID"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Must be a valid email address"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Must be a valid phone number"),
];

const validateUUID = [
  param("id").isUUID().withMessage("Must be a valid UUID"),
];

const validateDeleteCustomer = [
  param("id").isUUID().withMessage("Must be a valid UUID"),
];

const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Page must be a non-negative integer"),
  query("size")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Size must be a positive integer"),
];

// ------------------------Admin validation-------------------------------------------------------------------------

const validateUpdateAdmin = [
  param("id").isUUID().withMessage("Must be a valid UUID"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Must be a valid email address"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Must be a valid phone number"),
];

const validateFindOneAdmin = [
  param("id").isUUID().withMessage("Must be a valid UUID"),
];

const validateDeleteAdmin = [
  param("id").isUUID().withMessage("Must be a valid UUID"),
];
// ---------------------product validation---------------------------------------

const productValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional(),
    body('features').notEmpty().withMessage('Features is required'),
    body('media').optional().isObject().withMessage('Media must be a valid JSON object')
];


const validateProductUpdate = [
  param('id').isUUID().withMessage('Must provide a valid ID'),
  body('name').optional(),
  body('description').optional(),
  body('media').optional().isObject().withMessage('Media must be a valid JSON object')
];

// ----------------------SUBSCRIPTION VALIDATION-----------------------------------------------------------------
const validateSubscriptionPlanCreation = [
    body('frequency').notEmpty().withMessage('Frequency is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('productId').notEmpty().isUUID().withMessage('Valid Product ID is required')
];

// ==========================================================================================

const isValidEmail = (email) => validator.isEmail(email);

const isValidPhone = (phone) => validator.isMobilePhone(phone, "en-IN");

const isValidPassword = (password) => {
  if (password.length < 8 || password.length > 25) {
    return "Password should be between 8 to 25 characters long";
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return "Password should contain at least a uppercase letter, lower case letter, number and special character";
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return "Password should contain at least a uppercase letter, lower case letter, number and special character";
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return "Password should contain at least a uppercase letter, lower case letter, number and special character";
  }
  
  if (!/(?=.*[@$!%*?&.,:;<>^()[\]{}+_=|/~`#\\-])/.test(password)) {
    return "Password should contain at least a uppercase letter, lower case letter, number and special character";
  }
  
  if (/^\s|\s$/.test(password)) {
    return "Your password can't start or end with a blank space";
  }
  
  // If all checks pass, the password is valid
  return null;
};

const isValidLength = (name) => {
  if (!name) {
    return "Name is required";
  }
  
  // Trim leading and trailing spaces and reduce multiple spaces to single space
  name = name.trim().replace(/\s+/g, ' ');

  if (name.length < 4 || name.length > 40) {
    return "Name should be between 4 and 40 characters long";
  }
  
  if (/^[0-9]/.test(name)) {
    return "Name should only contain letters and spaces";
  }
  
  if (/\d/.test(name)) {
    return "Name should only contain letters and spaces";
  }
  
  if (/[^a-zA-Z\s]/.test(name)) {
    return "Name should only contain letters and spaces";
  }
  
  return null;  // No errors
};

// const isDateGreterThanToday = date => moment(date).isSameOrAfter(today, "day");

// const isValidStartTime = startTime => moment(startTime).isSameOrAfter(today);

// const isValidEndTime = (startTime, endTime) => moment(endTime).isAfter(startTime);

module.exports = {
  validateSignup,
  validateSignin,
  validateUUID,
  validateUpdateCustomer,
  validateVerifyEmail,
  validatePagination,
  //   -------------------------
  validateUpdateAdmin,
  validateFindOneAdmin,
  validateDeleteAdmin,
  // ===============================
  productValidation,
  validateProductUpdate,
//   ===============================
validateSubscriptionPlanCreation,
// --------------------------------
  isValidEmail,
  isValidPhone,
  //   isDateGreterThanToday,
  //   isValidStartTime,
  //   isValidEndTime,
  isValidPassword,
  isValidLength,
};
