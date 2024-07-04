const db = require("../db/dbConnection.js");
const Admin = db.admins;
const asyncHandler = require("../utils/asyncHandler.js");
const ErrorHandler = require("../utils/errorHandler.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// Helper function to generate JWT
const generateToken = (admin) => {
  return jwt.sign({ obj: admin }, process.env.JWT_SECRET, {
    expiresIn: "72h", // expires in 24 hours
  });
};


// -------------------ADMIN SIGNUP------------------------------------------------------
const adminSignup = asyncHandler(async (req, res, next) => {
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
    const existingAdmin = await Admin.findOne({ where: { email } });

    if (existingAdmin) {
      return next(new ErrorHandler("Email is already in use.", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToken = generateToken({ email }); // This should ideally be a different token, specific for email verification

    const admin = await Admin.create({
      email,
      password: hashedPassword,
      phone,
      emailToken,
      // Additional fields as necessary
    });

    //sendVerificationEmail(email, emailToken);

    res.status(201).send({
      id: admin.id,
      email: admin.email,
      // Add additional fields as necessary
    });
  } catch (error) {
    return next(new ErrorHandler( "Some error occurred during signUp.", error, 500));
  }
});

// --------------------------ADMIN SIGNIN-----------------------------------------------------
const adminSignin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email) {
      return next(new ErrorHandler("email is missing", 400));
    }

    if (!password) {
      return next(new ErrorHandler("password is missing", 400));
    }
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return next(new ErrorHandler("admin not found.", 404 ));
    }
    //if (!customer.IsActivated) {
    //    return res.status(401).json({ message: "Customer not found" });
    //}
    //if (!customer.IsEmailVerified) {
    //    return res.status(401).json({ message: "Email not verified" });
    //}

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        next(new ErrorHandler("Invalid password.", 400 ));
    }

    const obj = {
      type: "ADMIN",
      obj: admin,
    };

    const token = generateToken(obj);

    res.status(200).send({
      id: admin.id,
      email: admin.email,
      token: token,
      // Add additional fields as necessary
    });
  } catch (error) {
    return next(new ErrorHandler( "Some error occurred during signin.", error, 500));
  }
});

// ------------------FORGET PASSWORD-------------------------------------------------------
const forgotPassword = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ErrorHandler("email is missing", 400));
    }

    const adminInfo = await Admin.findOne({
      where: {
        email: email.trim(),
      },
    });

    if (!adminInfo) {
      return next(new ErrorHandler("admin not found", 404));
    }
    return res.status(200).send({
      success: true,
      message: "valid email",
      adminID: adminInfo.id,
    });
  } catch (error) {
    return next(new ErrorHandler("An error occurred", error, 500));
  }
});

// -----------------RESET PASSWORD-------------------------------------------------
const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    const { password } = req.body;
    const adminId = req.params.adminId;

    const findAdmin = await Admin.findByPk(adminId);

    if (!findAdmin) {
      return next(new ErrorHandler("admin not found", 404));
    }

    if (!password) {
      return next(new ErrorHandler("Password is missing", 400));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    findAdmin.password = hashedPassword;

    await findAdmin.save({ validate: false });

    const loggedInAdmin = await Admin.findByPk(findAdmin.id, {
      attributes: {
        exclude: ["password"],
      },
    });

    return res.status(200).json({
      success: true,
      data: loggedInAdmin,
    });
  } catch (error) {
    return next(new ErrorHandler("An error occurred", error, 500));
  }
});

module.exports = {
  adminSignup,
  adminSignin,
  forgotPassword,
  resetPassword,
};
