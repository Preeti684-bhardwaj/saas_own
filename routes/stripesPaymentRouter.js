const express = require("express");
const router = express.Router();
const {
  stripePayment,
  getSessionDetails,
} = require("../controllers/stripePaymentController");
const bodyParser = require("body-parser");
const { createOrder} = require("../controllers/orderController");
const { createSubscription } = require("../controllers/subscriptionController");
const { createTransaction } = require("../controllers/transactionController");
const db = require("../db/dbConnection");
const dotenv = require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
let endpointSecret;

// = process.env.STRIPE_WEBHOOK_SECRET;

// Checkout session
router.post("/create-checkout-session", stripePayment);
router.get("/get-session", getSessionDetails);
// router.get('/success', orderDetails);

// Setup webhook
router.post("/hook",express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let data;
    let eventType;
    if (endpointSecret) {
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
      data = event.data.object;
      eventType = event.type;
    } else {
      data = req.body.data.object;
      eventType = req.body.type;
    }
    // Handle the event

    // if (eventType =="checkout.session.async_payment_failed")
    //  {
    //   stripe.customers
    //     .retrieve(data.customer)
    //     .then((customer) => {
    //       console.log("transaction pending ya fail",customer);
    //       console.log("data transaction", data);
    //       createTransaction(data, customer);
    //     })
    //     .catch((err) => console.log(err.message));
    // }

    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then((customer) => {
          // console.log("customer",customer);
          // console.log("data", data);
          createOrder(customer, data);
          createTransaction(data);
          createSubscription(
            data.metadata.userId,
            data.metadata.frequency,
             data.amount_total
          );
        })
        .catch((err) => console.log(err.message));
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send();
  }
);

module.exports = router;
