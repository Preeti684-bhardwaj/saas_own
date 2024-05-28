const db = require("../db/dbConnection");
const asyncHandler = require("../utils/asyncHandler");
const errorHandler = require("../utils/errorHandler");
const Product = db.products;
const SubscriptionPlan = db.subscriptionPlans;
const { validationResult } = require("express-validator");

// Create and Save a new Product
const createProduct = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const existingProduct = await Product.findOne({
      where: { name: req.body.name },
    });
    if (existingProduct) {
      return next(new errorHandler("Product already exist", 400));
    }
    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      features: req.body.features,
      media: req.body.media,
    });
    res.status(201).send(product);
  } catch (error) {
    return next(
      new errorHandler(
        error.message || "Some error occurred while creating the Product.",
        500
      )
    );
  }
});

const findAllWithSubscriptionPlans = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page, 10) : 0; // Default to page 0 if not provided
  const size = req.query.size ? parseInt(req.query.size, 10) : 10; // Default size is 10
  const offset = page * size;
  const limit = size;

  try {
    const data = await Product.findAndCountAll({
      include: [
        {
          model: SubscriptionPlan,
          as: "subscriptionPlans", // Use the correct association alias
        },
      ],
      limit,
      offset,
      distinct: true, // Needed for correct total count when including a one-to-many relationship
    });

    const response = {
      totalItems: data.count,
      products: data.rows,
      totalPages: Math.ceil(data.count / limit),
      currentPage: page,
    };

    res.send(response);
  } catch (error) {
    return next(
      new errorHandler(
        error.message || "Some error occurred while retrieving products."
      )
    );
  }
};

// Retrieve all Products from the database (with pagination)
const findAllProduct = async (req, res) => {
  const { page, size } = req.query;
  const limit = size ? +size : 10; // default size
  const offset = page ? page * limit : 0;

  console.log(Product);
  try {
    const data = await Product.findAndCountAll({ limit, offset });
    res.send({
      totalItems: data.count,
      products: data.rows,
      totalPages: Math.ceil(data.count / limit),
      currentPage: page ? +page : 0,
    });
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while retrieving products.",
    });
  }
};

// Find a single Product with an id
const findOneProduct = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.findByPk(id);
    if (product) {
      res.send(product);
    } else {
      res.status(404).send({
        message: `Cannot find Product with id=${id}.`,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving Product with id=" + id,
    });
  }
};

// Update a Product by the id in the request
const updateProduct = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Product.update(req.body, { where: { id: id } });
    if (num == 1) {
      res.send({
        message: "Product was updated successfully.",
      });
    } else {
      res.send({
        message: `Cannot update Product with id=${id}. Maybe Product was not found or req.body is empty!`,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error updating Product with id=" + id,
    });
  }
};

// Delete a Product with the specified id in the request
const deleteProduct = async (req, res) => {
  const id = req.params.id;
console.log(id);
  try {
    const num = await Product.destroy({ where: { id: id } });
    if (num == 1) {
      res.send({
        message: "Product was deleted successfully!",
      });
    } else {
      res.send({
        message: `Cannot delete Product with id=${id}. Maybe Product was not found!`,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Could not delete Product with id=" + id,
    });
  }
};

module.exports = {
  createProduct,
  findAllWithSubscriptionPlans,
  findAllProduct,
  findOneProduct,
  updateProduct,
  deleteProduct,
};
