const db = require("../db/dbConnection.js");
const Customer = db.customers;
const asyncHandler = require("../utils/asyncHandler.js");
const ErrorHandler = require("../utils/errorHandler.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const mail = require('../mail/mailgun.js');
const { validationResult } = require("express-validator");

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ obj: user }, process.env.JWT_SECRET, {
    expiresIn: "72h", // expires in 24 hours
  });
};
// -----------------CUSTOMER SIGNUP-----------------------------------------------------
const customerSignup = asyncHandler(async (req, res, next) => {
  try {
    const { email, password, phone } = req.body;
    if (!email) {
      return next(new ErrorHandler("email is missing", 400));
    }

    if (!password) {
      return next(new ErrorHandler("password is missing", 400));
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const existingUser = await Customer.findOne({ where: { email } });

    if (existingUser) {
      return next(new ErrorHandler("Email is already in use.", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToken = generateToken({ email }); // This should ideally be a different token, specific for email verification

    const customer = await Customer.create({
      email,
      password: hashedPassword,
      phone,
      emailToken,
      // Additional fields as necessary
    });

    //sendVerificationEmail(email, emailToken);

    res.status(201).send({
      id: customer.id,
      email: customer.email,
      // Add additional fields as necessary
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        error.message || "Some error occurred during signup.",
        500
      )
    );
  }
});

// -----------------CUSTOMER SIGNIN-----------------------------------------------------
const customerSignin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email) {
      return next(new ErrorHandler("email is missing", 400));
    }

    if (!password) {
      return next(new ErrorHandler("password is missing", 400));
    }
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return next(new ErrorHandler("Customer not found.", 404));
    }
    //if (!customer.IsActivated) {
    //    return res.status(401).json({ message: "Customer not found" });
    //}
    //if (!customer.IsEmailVerified) {
    //    return res.status(401).json({ message: "Email not verified" });
    //}

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return next(new ErrorHandler("Invalid password.", 400));
    }

    const obj = {
      type: "CUSTOMER",
      obj: customer,
    };

    const token = generateToken(obj);

    res.status(200).send({
      id: customer.id,
      email: customer.email,
      token: token,
      // Add additional fields as necessary
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        error.message || "Some error occurred during signin.",
        500
      )
    );
  }
});

// ---------------FORGET PASSWORD-----------------------------------------------------
const forgotPassword = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ErrorHandler("email is missing", 400));
    }

    const customerInfo = await Customer.findOne({
      where: {
        email: email.trim(),
      },
    });

    if (!customerInfo) {
      return next(new ErrorHandler("customer not found", 404));
    }
    return res.status(200).send({
      success: true,
      message: "valid email",
      customerID: customerInfo.id,
    });
  } catch (error) {
    return next(new ErrorHandler("An error occurred", error, 500));
  }
});

// ---------------RESET PASSWORD------------------------------------------------------------
const resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const customerId = req.params.customerId;

  const findCustomer = await Customer.findByPk(customerId);

  if (!findCustomer) {
    return next(new ErrorHandler("customer not found", 404));
  }

  if (!password) {
    return next(new ErrorHandler("Password is missing", 400));
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  findCustomer.password = hashedPassword;

  await findCustomer.save({ validate: false });

  const loggedInCustomer = await Customer.findByPk(findCustomer.id, {
    attributes: {
      exclude: ["password"],
    },
  });

  return res.status(200).json({
    success: true,
    data: loggedInCustomer,
  });
});

// ====================trial period====================================================

const freeTrial = asyncHandler(async (req, res, next) => {
  try {
    const customerId = req.decodedToken.obj.obj.id;

    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      return res.status(404).send("Customer not found");
    }

    const trialDays = 14;
    const trialStartDate = new Date();
    const trialEndDate = new Date(
      trialStartDate.getTime() + trialDays * 24 * 60 * 60 * 1000
    );

    customer.trialStartDate = trialStartDate;
    customer.trialEndDate = trialEndDate;
    customer.isTrialActive = true;

    await customer.save();

    res.status(200).send({success:true,message:"Trial started successfully",customer});
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

module.exports = {
  customerSignup,
  customerSignin,
  forgotPassword,
  resetPassword,
  freeTrial,
};
