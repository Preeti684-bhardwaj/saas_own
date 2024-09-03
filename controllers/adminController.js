const db = require("../db/dbConnection.js");
const Admin = db.admins;
const asyncHandler = require("../utils/asyncHandler.js");
// const ErrorHandler = require("../utils/errorHandler.js");
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
const adminSignup = asyncHandler(async (req, res) => {
  try {
    const { email, password, phone } = req.body;
    if (!email) {
      return res.status(400).send({status:false,message:"email is missing"});
    }

    if (!password) {
      return res.status(400).send({status:false,message:"password is missing"});
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const existingAdmin = await Admin.findOne({ where: { email } });

    if (existingAdmin) {
      return res.status(400).send({status:false,message:"Email is already in use."});
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
    return es.status(500).send({status:false,message:error.message||"Some error occurred during signUp."});
  }
});

// --------------------------ADMIN SIGNIN-----------------------------------------------------
const adminSignin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email) {
      return res.status(400).send({status:false,message:"email is missing"});
    }

    if (!password) {
      return res.status(400).send({status:false,message:"password is missing"});
    }
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(404).send({status:false,message:"admin not found."});
    }
    //if (!customer.IsActivated) {
    //    return res.status(401).json({ message: "Customer not found" });
    //}
    //if (!customer.IsEmailVerified) {
    //    return res.status(401).json({ message: "Email not verified" });
    //}

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
       returnres.status(400).send({status:false,message:"Invalid password."});
    }

    const obj = {
      type: "ADMIN",
      obj: admin,
    };

    const token = generateToken(obj);

    res.status(200).send({
      status:true,
      id: admin.id,
      email: admin.email,
      token: token,
      // Add additional fields as necessary
    });
  } catch (error) {
    return res.status(500).send({status:false,message:error.message||"Some error occurred during signin."});
  }
});

// ------------------FORGET PASSWORD-------------------------------------------------------
const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({status:false,message:"email is missing"});
    }

    const adminInfo = await Admin.findOne({
      where: {
        email: email.trim(),
      },
    });

    if (!adminInfo) {
      return res.status(404).send({status:false,message:"admin not found"});
    }
    return res.status(200).send({
      success: true,
      message: "valid email",
      adminID: adminInfo.id,
    });
  } catch (error) {
    return res.status(500).send({status:false,message:error.message||"An error occurred"});
  }
});

// -----------------RESET PASSWORD-------------------------------------------------
const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { password } = req.body;
    const adminId = req.params.adminId;

    if (!password) {
      return res.status(400).send({status:false,message:"Password is missing"});
    }

    const findAdmin = await Admin.findByPk(adminId);

    if (!findAdmin) {
      return res.status(404).send({status:false,message:"admin not found"});
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
    returnres.status(500).send({status:false,message:error.message||"An error occurred"});
  }
});

module.exports = {
  adminSignup,
  adminSignin,
  forgotPassword,
  resetPassword,
};
