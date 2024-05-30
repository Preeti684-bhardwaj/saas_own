// const db = require("../db/dbConnection");
// const Order = db.orders;
// const asyncHandler = require("../utils/asyncHandler");
// const errorHandler = require("../utils/errorHandler");
// const Subscription =db.subscriptions;
// const calculateEndDate = require('../utils/endDateConfigure');

// // createOrder

// const createOrder = asyncHandler(async (customer, data) => {
//   const transaction = await db.sequelize.transaction();

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
//         amount: data.amount_total / 100,
//         currency: data.currency,
//         method: data.payment_method_types[0],
//       },
//       status: 'pending',
//     }, { transaction });

//     console.log('Order created successfully:', order);

//     if (data.payment_status === 'paid') {
//       await handleSuccessfulPayment(order, customer, data, transaction);
//     } else if (data.payment_status === 'failed') {
//       await handleFailedPayment(order, customer, data, transaction);
//     } else if (data.payment_status === 'pending') {
//       await handlePendingPayment(order, customer, data, transaction);
//     }

//     await transaction.commit();
//     return order;
//   } catch (error) {
//     await transaction.rollback();
//     console.error('Error creating order:', error);
//     throw new Error('Error creating order');
//   }
// });

// const handleSuccessfulPayment = async (order, customer, data, transaction) => {
//   try {
//     order.status = 'paid';
//     await order.save({ transaction });

//     const startDate = new Date();
//     const duration = data.metadata.duration; // Ensure duration is provided in metadata
//     const endDate = calculateEndDate(startDate, duration);

//     const subscription = await Subscription.create({
//       userId: customer.metadata.userId,
//       planId: data.metadata.planId,
//       status: 'active',
//       startDate,
//       endDate,
//       duration,
//     }, { transaction });

//     console.log('Payment succeeded and subscription created or updated:', subscription);
//   } catch (error) {
//     console.error('Error handling successful payment:', error);
//     throw error;
//   }
// };

// const handleFailedPayment = async (order, customer, data, transaction) => {
//   try {
//     order.status = 'failed';
//     await order.save({ transaction });

//     console.log('Payment failed for order:', order);
//   } catch (error) {
//     console.error('Error handling failed payment:', error);
//     throw error;
//   }
// };

// const handlePendingPayment = async (order, customer, data, transaction) => {
//   try {
//     console.log('Payment pending for order:', order);
//   } catch (error) {
//     console.error('Error handling pending payment:', error);
//     throw error;
//   }
// };

// // const createOrder = asyncHandler(async (customer, data) => {
// //   try {
// //     const order = await Order.create({
// //       userId: customer.metadata.userId,
// //       StripeCustomerId: data.customer,
// //       date: new Date(),
// //       invoiceNumber: data.invoice,
// //       subscription: data.metadata,
// //       payment: {
// //         intentId: data.payment_intent,
// //         status: data.payment_status,
// //         amount: data.amount_total / 100,
// //         currency: data.currency,
// //         method: data.payment_method_types[0],
// //       },
// //       status: data.status,
// //     });
// //     console.log("Order created successfully:", order);
// //     return order;
// //   } catch (error) {
// //     console.error("Error creating order:", error);
// //     throw new Error("Error creating order");
// //   }
// // });

// module.exports = {
//   createOrder,
// };