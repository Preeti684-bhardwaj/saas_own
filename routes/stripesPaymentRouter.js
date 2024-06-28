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

// Checkout session
router.post("/create-checkout-session", stripePayment);
router.get("/get-session", getSessionDetails);

// Setup webhook
router.post("/hook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let data;
  let eventType;

  try {
    if (endpointSecret) {
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      data = event.data.object;
      eventType = event.type;
    } else {
      data = req.body.data.object;
      eventType = req.body.type;
    }

    if (eventType === "checkout.session.completed") {
      console.log("hiii");
      try {
        const customer = await stripe.customers.retrieve(data.customer);
        console.log(data);
        await createOrder(customer, data);
        await createTransaction(data);
        await createSubscription(data.metadata.userId, data.metadata.features,data.metadata.frequency,data.metadata.planName, data.amount_total);
      } catch (err) {
        console.error(err.message);
        return res.status(500).send(`Internal Server Error: ${err.message}`);
      }
    }

    res.status(200).send(); // Acknowledge receipt of the event
  } catch (err) {
    console.error(err.message);
    res.status(500).send(`Internal Server Error: ${err.message}`);
  }
});

module.exports = router;
