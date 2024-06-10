// const express = require("express");
// const router = express.Router();
// // const { stripePayment, getSessionDetails } = require('../controllers/stripePaymentController');
// const bodyParser = require('body-parser');
// const db = require('../db/dbConnection');
// const dotenv = require('dotenv').config();
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// let endpointSecret;

// // = process.env.STRIPE_WEBHOOK_SECRET;

// Checkout session order data 
// router.post("/create-checkout-session", stripePayment);
// router.get("/", getSessionDetails);

// const createOrder = async (customer, data) => {
//   try {
//     const newOrder = await db.orders.create({
//       customerId: customer.metadata.userId,
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
//       status: data.status,
//     });
//     console.log("Order created successfully:", newOrder);
//     return newOrder;
//   } catch (error) {
//     console.error("Error creating order:", error);
//     throw new Error('Error creating order');
//   }
// };

// Setup webhook
// router.post('/hook', express.raw({ type: 'application/json' }), (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   let data;
//   let eventType;
//   if (endpointSecret) {
//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       res.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }
//     data = event.data.object;
//     eventType = event.type;
//   } else {
//     data = req.body.data.object;
//     eventType = req.body.type;
//   }
//   // Handle the event
//   if (eventType === "checkout.session.completed") {
//     stripe.customers.retrieve(data.customer).then((customer) => {
//       console.log(customer);
//       console.log("data", data);
//       createOrder(customer, data);
//     }).catch(err => console.log(err.message));
//   }
//   // Return a 200 response to acknowledge receipt of the event
//   res.send();
// });

// module.exports = router;
