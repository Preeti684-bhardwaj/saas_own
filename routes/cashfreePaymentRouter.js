const express = require("express");
const router = express.Router();
const {
  cashfreePayment,
  getStatus,
  getSessionDetails,
} = require("../controllers/cashfreePaymentController");
// const {getAccessToken}=require('../middlewares/auth')
// const bodyParser = require("body-parser");
// const { createOrder} = require("../controllers/orderController");
// const { createSubscription } = require("../controllers/subscriptionController");
// const { createTransaction } = require("../controllers/transactionController");
// const db = require("../db/dbConnection");
const { Cashfree } =require("cashfree-pg"); 
const { XClientId, XClientSecret} = process.env;


Cashfree.XClientId =XClientId ;
Cashfree.XClientSecret =XClientSecret;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

// Checkout session
router.post("/create-checkout-session", cashfreePayment);
router.get('/order-status/:order_id', getStatus);
router.get("/get-session", getSessionDetails);

// Setup webhook
router.post('/webhook',  (req, res)=> {
  try {
     const data = Cashfree.PGVerifyWebhookSignature(req.headers["x-webhook-signature"], req.rawBody, req.headers["x-webhook-timestamp"])
  console.log(data);
  console.log("hii from webhook");
  
    } catch (err) {
      console.log(err.message)
  }
})

//   try {
//     if (endpointSecret) {
//       let event;
//       try {
//         event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//       } catch (err) {
//         console.error(`Webhook Error: ${err.message}`);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//       }
//       data = event.data.object;
//       eventType = event.type;
//     } else {
//       data = req.body.data.object;
//       eventType = req.body.type;
//     }

//     if (eventType === "checkout.session.completed") {
//       console.log("hiii");
//       try {
//         const customer = await stripe.customers.retrieve(data.customer);
//         console.log(data);
//         await createOrder(customer, data);
//         await createTransaction(data);
//         await createSubscription(data.metadata.userId, data.metadata.features,data.metadata.frequency,data.metadata.planName, data.amount_total);
//       } catch (err) {
//         console.error(err.message);
//         return res.status(500).send(`Internal Server Error: ${err.message}`);
//       }
//     }

//     res.status(200).send(); // Acknowledge receipt of the event
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send(`Internal Server Error: ${err.message}`);
//   }
// });

module.exports = router;
