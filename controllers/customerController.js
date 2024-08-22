const db = require("../db/dbConnection.js");
const Customer = db.customers;
const asyncHandler = require("../utils/asyncHandler.js");
const ErrorHandler = require("../utils/errorHandler.js");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const sendEmail = require("../utils/sendEmail.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  isValidEmail,
  // isValidPhone,
  isValidPassword,
  isValidLength,
} = require("../utils/validation.js");
// const mail = require('../mail/mailgun.js');
const { validationResult } = require("express-validator");

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ obj: user }, process.env.JWT_SECRET, {
    expiresIn: "72h", // expires in 24 hours
  });
};
const generateOtp = () => {
  // Define the possible characters for the OTP
  const chars = "0123456789";
  // Define the length of the OTP
  const len = 6;
  let otp = "";
  // Generate the OTP
  for (let i = 0; i < len; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }

  this.otp = otp;
  this.otpExpire = Date.now() + 15 * 60 * 1000;

  return otp;
};

// Helper function to generate API key
const generateApiKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

// -----------------CUSTOMER SIGNUP-----------------------------------------------------
const customerSignup = asyncHandler(async (req, res, next) => {
  try {
    const { name: rawName, phone, email, password } = req.body;
    
    if (!rawName) {
      return next(new ErrorHandler("name is missing", 400));
    }
    if (!phone) {
      return next(new ErrorHandler("phone is missing", 400));
    }
    if (!email) {
      return next(new ErrorHandler("email is missing", 400));
    }
    if (!password) {
      return next(new ErrorHandler("password is missing", 400));
    }

    // Sanitize name: trim and reduce multiple spaces to single space
    const name = rawName.trim().replace(/\s+/g, ' ');

    // Validate input fields
    if ([name, phone, email, password].some((field) => field === "")) {
      return res.status(400).send({
        success: false,
        message: "Please provide all necessary fields",
      });
    }

    // Validate name
    const nameError = isValidLength(name);
    if (nameError) {
      return res.status(400).send({ success: false, message: nameError });
    }

    if (!isValidEmail(email)) {
      return res.status(400).send({ message: "Invalid email" });
    }

    // Convert the email to lowercase for case-insensitive comparison
    const lowercaseEmail = email.toLowerCase();

    // Use a case-insensitive query to check for existing email
    const existingUser = await Customer.findOne({
      where: {
        [Op.or]: [{ email: lowercaseEmail }, { phone }],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === lowercaseEmail && existingUser.phone === phone) {
        return res.status(400).send({ message: "Account already exists" });
      } else if (existingUser.email.toLowerCase() === lowercaseEmail) {
        return res.status(400).send({ message: "Email already in use" });
      } else {
        return res.status(400).send({ message: "Phone number already in use" });
      }
    }

    const passwordValidationResult = isValidPassword(password);
    if (passwordValidationResult) {
      return res.status(400).send({
        success: false,
        message: passwordValidationResult,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToken = generateToken({ email: lowercaseEmail });

    const customer = await Customer.create({
      name,
      email: lowercaseEmail,
      password: hashedPassword,
      phone,
      emailToken,
    });

    res.status(201).send({
      id: customer.id,
      name: customer.name,
      email: customer.email,
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
// ===========
//     const existingUser = await Customer.findOne({ where: { email } });

//     if (existingUser) {
//       return next(new ErrorHandler("Email is already in use.", 400));
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const emailToken = generateToken({ email }); // This should ideally be a different token, specific for email verification

//     const customer = await Customer.create({
//       email,
//       password: hashedPassword,
//       phone,
//       emailToken,
//       // Additional fields as necessary
//     });

//     //sendVerificationEmail(email, emailToken);

//     res.status(201).send({
//       id: customer.id,
//       email: customer.email,
//       // Add additional fields as necessary
//     });
//   } catch (error) {
//     return next(
//       new ErrorHandler(
//         error.message || "Some error occurred during signup.",
//         500
//       )
//     );
//   }
// });
// ----------------send otp-----------------------------
const sendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: "Missing email" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).send({ message: "Invalid Email" });
  }

  try {
    const customer = await Customer.findOne({
      where: {
        email: email.trim(),
      },
    });

    if (!customer) {
      return res.status(404).send({ message: "Customer not found" });
    }

    const otp = generateOtp();
    customer.otp = otp;
    customer.otpExpire = Date.now() + 15 * 60 * 1000;

    await customer.save({ validate: false });

    // Create HTML content for the email
    const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <img src="https://stream.xircular.io/AIengage.png" alt="AI Engage Logo" style="max-width: 200px; margin-bottom: 20px;">
    <h2>One-Time Password (OTP) for Verification</h2>
    <p>Hello,</p>
    <p>Your One Time Password (OTP) for AI Engage is:</p>
    <h1 style="font-size: 32px; background-color: #f0f0f0; padding: 10px; display: inline-block;">${otp}</h1>
    <p>This OTP is valid for 15 minutes.</p>
    <p>If you didn't request this OTP, please ignore this email.</p>
    <p>Best regards,<br>AI Engage Team</p>
  </div>
`;

    try {
      await sendEmail({
        email: customer.email,
        subject: `AI Engage: Your One-Time Password (OTP) for Verification`,
        html: htmlContent,
      });

      res.status(200).json({
        success: true,
        message: `OTP sent to ${customer.email} successfully`,
        email: customer.email,
        customerId: customer.id,
      });
    } catch (emailError) {
      customer.otp = null;
      customer.otpExpire = null;
      await customer.save({ validate: false });

      console.error("Failed to send OTP email:", emailError);
      return res.status(500).send(emailError.message);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});
// ==========================email verification------------------------------
const emailOtpVerification = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Validate the OTP
  if (!email) {
    return next(new ErrorHandler("email is missing", 400));
  }
  if (!otp) {
    return res
      .status(400)
      .json({ success: false, message: "OTP is required." });
  }

  try {
    const customer = await Customer.findOne({ where: { email: email } });
    console.log(customer);
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Customer not found or invalid details.",
      });
    }

    // Check OTP validity
    if (customer.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (customer.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: "expired OTP." });
    }

    // Update agent details
    customer.isEmailVerified = true;
    customer.otp = null;
    customer.otpExpire = null;
    await customer.save();

    res.status(201).json({
      success: true,
      message: "Customer data",
      agent: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isEmailVerified: customer.isEmailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
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
      return res.status(404).send({status :false,message :"Customer not found."});
    }
    //if (!customer.IsActivated) {
    //    return res.status(401).json({ message: "Customer not found" });
    //}
    if (!customer.isEmailVerified) {
      return res.status(401).json({ message: "Email not verified" });
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(400).send({status :false,message : "Invalid password."});
    }

    const obj = {
      type: "CUSTOMER",
      obj: customer,
    };
    let apiKey = customer.api_key;
    if (!apiKey) {
      // Generate API key
      apiKey = generateApiKey();
      // Update the customer record with the new API key
      await customer.update({ api_key: apiKey });
    }
    const options = {
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      httpOnly: false,
      secure: true,
      sameSite: "none",
      path: "/",
    };
    //  generate token
    const token = generateToken(obj);
    res.cookie("access_token", token, options)
    console.log("i am from signin",req.cookies)
    res.status(200).send({
      success: true,
      message: "login successfully",
      id: customer.id,
      email: customer.email,
      token: token,
      api_key: apiKey,
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
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: "Missing email id" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).send({ message: "Invalid email address" });
  }

  let customer;

  try {
    customer = await Customer.findOne({
      where: {
        email: email.trim(),
      },
    });

    if (!customer) {
      return res.status(404).send({ message: "Customer not found" });
    }
    if (!customer.isEmailVerified) {
      return res.status(400).send({ message: "Customer is not verified" });
    }

    // Generate reset token and expiration time
    const resetToken = crypto.randomBytes(32).toString("hex");
    customer.resetToken = resetToken;
    customer.resetTokenExpire = Date.now() + 15 * 60 * 1000; // Set expiration time (15 minutes)

    await customer.save({ validate: false });

    const resetUrl = `https://aiengage.xircular.io/SignIn/resetPassword/${resetToken}`;

    // Create HTML content for the email
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <img src="https://stream.xircular.io/AIengage.png" alt="AI Engage Logo" style="max-width: 200px; margin-bottom: 20px;">
      <h2>Password Reset Request</h2>
      <p>Hello,</p>
      <p>You have requested a password reset for your AI Engage account. Please click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; margin-bottom: 15px;">Reset Password</a>
      <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
      <p>This link will expire in 15 minutes for security reasons.</p>
      <p>Best regards,<br>AI Engage Team</p>
    </div>
    `;

    // Create plain text content as a fallback
    const textContent = `
    Hello,

    You have requested a password reset for your AI Engage account. Please copy and paste the following link into your browser to reset your password:

    ${resetUrl}

    If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.

    This link will expire in 15 minutes for security reasons.

    Best regards,
    AI Engage Team
    `;

    await sendEmail({
      email: customer.email,
      subject: `AI Engage: Password Reset Request`,
      html: htmlContent,
      text: textContent,
    });

    res.status(200).json({
      success: true,
      message: `Password reset link sent to ${customer.email}`,
    });
  } catch (error) {
    if (customer) {
      customer.resetToken = null;
      customer.resetTokenExpire = null;
      await customer.save({ validate: false });
    }

    return res.status(500).send(error.message);
  }
});

// ---------------RESET PASSWORD------------------------------------------------------------
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params; // The token from the URL

  if (!password || !token) {
    return res
      .status(400)
      .send({ message: "Missing required fields: password" });
  }
  // Validate input fields
  if ([password].some((field) => field?.trim() === "")) {
    return res.status(400).send({
      success: false,
      message: "Please provide necessary field",
    });
  }
  const passwordValidationResult = isValidPassword(password);
  if (passwordValidationResult) {
    return res.status(400).send({
      success: false,
      message: passwordValidationResult,
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Find the customer by reset token
    const customer = await Customer.findOne({
      where: {
        resetToken: token,
        resetTokenExpire: { [Op.gt]: Date.now() }, // Check if token is not expired
      },
    });

    if (!customer) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    // Update the customer's password and clear token fields
    customer.password = hashedPassword;
    customer.resetToken = null;
    customer.resetTokenExpire = null;

    await customer.save({ validate: true });

    // Exclude password from the response
    const updatedCustomer = await Customer.findByPk(customer.id, {
      attributes: {
        exclude: ["password"],
      },
    });

    return res.status(200).json({
      success: true,
      message: `Password updated for ${updatedCustomer.email}`,
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// ===================get user by id------------------------------------

const getUserById = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.userId;
    const item = await Customer.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    if (!item) {
      res.status(404).json({ success: false, error: "User not found" });
    } else {
      res.json({ success: true, data: item });
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// ====================trial period====================================================

const freeTrial = asyncHandler(async (req, res, next) => {
  try {
    const customerId = req.decodedToken.obj.obj.id;

    const customer = await Customer.findByPk(customerId, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!customer) {
      return res
        .status(404)
        .send({ success: false, message: "Customer not found" });
    }
    if (customer.isSubscribed) {
      return res
        .status(404)
        .send({ success: false, message: "upgrade your plan" });
    }
    const trialDays = 14;
    const trialStartDate = new Date();
    const trialEndDate = new Date(
      trialStartDate.getTime() + trialDays * 24 * 60 * 60 * 1000
    );

    customer.trialStartDate = trialStartDate;
    customer.trialEndDate = trialEndDate;
    customer.isTrialActive = true;

    // Set the freeTrialFeature values
    customer.freeTrialFeature = {
      totalResponse: 2, // Example value, set according to your needs
      // videoLength: 30, // Example value in minutes
      // campaignStorage: 500, // Example value in MB
    };

    await customer.save();

    res
      .status(200)
      .send({ success: true, message: "Trial started successfully", customer });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});
const logOut = asyncHandler(async (req, res) => {
  return res
    .clearCookie("access_token",{
      httpOnly: false,
      secure: true,
      sameSite: "none",
      path: "/"
    })
    .status(200)
    .json({ message: "Successfully logged out" });
});

const deleteUser = asyncHandler(async(req,res,next)=>{
  const { phone } = req.body;
  try {
    const user = await Customer.findOne({ where: { phone:phone } });
    console.log(user);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found or invalid details.",
      });
    }
    await user.destroy();
    res.status(200).send({
      success: true,
      message: `user with phone ${user.phone} deleted successfully`,
    });
  } catch (err) {
    return next(new ErrorHandler(err.message, 500));
  }
})
const getUser = asyncHandler(async (req, res, next) => {
  try {
    const item = await Customer.findAll({
      attributes: { exclude: ["password"] },
    });
    if (!item) {
      res.status(404).json({ success: false, error: "User not found" });
    } else {
      res.json({ success: true, data: item });
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
module.exports = {
  customerSignup,
  sendOtp,
  emailOtpVerification,
  getUserById,
  customerSignin,
  forgotPassword,
  resetPassword,
  freeTrial,
  logOut,
  deleteUser,
  getUser
};
