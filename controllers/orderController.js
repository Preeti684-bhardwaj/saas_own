// const { Order } = require("../models/orderModel");
// const { Customer } = require("../models/customerModel");
// const asyncHandler = require("../utils/asyncHandler");
// const errorHandler = require("../utils/errorHandler");


// // const createOrder = asyncHandler(async (req, res, next) => {
// //     const { customerId, subscription, payment, invoiceNumber } = req.body;

// //     if (!customerId || !subscription || !payment || !invoiceNumber) {
// //         return next(new errorHandler("All fields are required", 400));
// //     }

// //     try {
// //         const customer = await Customer.findByPk(customerId);

// //         if (!customer) {
// //             return next(new errorHandler("Customer not found", 404));
// //         }

// //         const order = await Order.create({
// //             customerId,
// //             date: new Date(),
// //             invoiceNumber,
// //             subscription,
// //             payment
// //         });

// //         res.status(201).json(order);
// //     } catch (error) {
// //         console.error("Error creating order:", error);
// //         return next(new errorHandler("Error creating order", 500));
// //     }
// // });

// // createOrder

// // createOrder
// const createOrder = async (customer, data) => {
//   try {
//     const order = await Order.create({
//       userId: customer.metadata.userId,
//       StripeCustomerId: data.customer,
//       date: new Date(),
//       invoiceNumber: data.invoice,
//       subscription: data.metadata,
//       payment: {
//         intentId: data.payment_intent,
//         status: data.payment_status,
//         amount: data.amount_total/100,
//         currency: data.currency,
//         method: data.payment_method_types[0],
//       },
//       status: data.status,
//     });
//     console.log("Order created successfully:", order);
//     return order;
//   } catch (error) {
//     console.error("Error creating order:", error);
//     throw new Error('Error creating order');
//   }
// };

// module.exports = {
//   createOrder,
// };
