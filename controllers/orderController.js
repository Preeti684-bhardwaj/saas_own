const db = require("../db/dbConnection");
const Order = db.orders;
const asyncHandler = require("../utils/asyncHandler");
const errorHandler = require("../utils/errorHandler");


// createOrder
const createOrder = asyncHandler(async (customer, data) => {
  try {
    const order = await Order.create({
      userId: customer.metadata.userId,
      StripeCustomerId: data.customer,
      date: new Date(),
      invoiceNumber: data.invoice,
      subscription: data.metadata,
      payment: {
        intentId: data.payment_intent,
        status: data.payment_status,
        amount: data.amount_total / 100,
        currency: data.currency,
        method: data.payment_method_types[0],
      },
      status: data.status,
    });
    console.log("Order created successfully:", order);
    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Error creating order");
  }
});

module.exports = {
  createOrder,
};