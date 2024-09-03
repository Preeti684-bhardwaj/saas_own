const db = require("../db/dbConnection");
const Product = db.products;
const SubscriptionPlan = db.subscriptionPlans;
const { validationResult } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
// const errorHandler = require("../utils/errorHandler");

// Create and Save a new Subscription Plan with Transaction
const createSubscriptionPlan = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, errors: errors.array() });
  }

  const { frequency, price, productId } = req.body;
  // const existingPlanFrequency = await SubscriptionPlan.findOne({
  //   where: { frequency: frequency},
  // });
  // if (existingPlanFrequency) {
  //   return next(new errorHandler("frequency already exist", 400));
  // }

  const transaction = await db.sequelize.transaction();

  try {
    // Ensure the Product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      await transaction.rollback();
      return res
        .status(404)
        .send({ status: false, message: "Product not found" });
    }

    const subscriptionPlan = await SubscriptionPlan.create(
      {
        frequency,
        price,
        productId,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).send(subscriptionPlan);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).send({
      status: false,
      message:
        error.message ||
        "Some error occurred while creating the Subscription Plan."
    });
  }
});

// Retrieve all Subscription Plans from the database (with pagination)
const subsFindAll = async (req, res) => {
  const { page, size, productId } = req.query;
  const condition = productId ? { productId: productId } : null;
  const limit = size ? +size : 14; // default size
  const offset = page ? page * limit : 0;

  try {
    const data = await SubscriptionPlan.findAndCountAll({
      where: condition,
      limit,
      offset,
    });
    res.status(200).send({
      status:true,
      totalItems: data.count,
      subscriptionPlans: data.rows,
      totalPages: Math.ceil(data.count / limit),
      currentPage: page ? +page : 0,
    });
  } catch (error) {
    res.status(500).send({
      status:false,
      message:
        error.message ||
        "Some error occurred while retrieving subscription plans.",
    });
  }
};
// find subsplan through frequency
const FindByFrequency = async (req, res) => {
  const { frequency } = req.query; // Extract frequency from request body

  try {
    const subscriptionPlans = await SubscriptionPlan.findAll({
      where: {
        frequency: frequency,
      },
      include: [
        {
          model: db.products,
          as: "product", // Use the correct association alias
        },
      ],
    });

    if (subscriptionPlans.length > 0) {
      res.status(200).send({status:true,subscriptionPlans});
    } else {
      res.status(404).send({
        status:false,
        message: `Cannot find any Subscription Plan with frequency=${frequency}.`,
      });
    }
  } catch (error) {
    res.status(500).send({
      status:false,
      message:
        "Error retrieving Subscription Plans with frequency=" + frequency,
      error: error.message,
    });
  }
};

// Find a single Subscription Plan with an id
const subsFindOne = async (req, res) => {
  const id = req.params.id;

  try {
    const subscriptionPlan = await SubscriptionPlan.findByPk(id);
    if (subscriptionPlan) {
      res.status(200).send({status:true,data:subscriptionPlan});
    } else {
      res.status(404).send({
        status:false,
        message: `Cannot find Subscription Plan with id=${id}.`,
      });
    }
  } catch (error) {
    res.status(500).send({
      status:false,
      message: "Error retrieving Subscription Plan with id=" + id,
    });
  }
};

// Delete a Subscription Plan with the specified id in the request
const deletePlanById = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await SubscriptionPlan.destroy({ where: { id: id } });
    if (num == 1) {
      res.status(200).send({
        status:true,
        message: "Subscription Plan was deleted successfully!",
      });
    } else {
      res.status(400).send({
        status:false,
        message: `Cannot delete Subscription Plan with id=${id}. Maybe Subscription Plan was not found!`,
      });
    }
  } catch (error) {
    res.status(500).send({
      status:false,
      message: "Could not delete Subscription Plan with id=" + id,
    });
  }
};

module.exports = {
  createSubscriptionPlan,
  FindByFrequency,
  subsFindAll,
  subsFindOne,
  deletePlanById,
};
