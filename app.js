const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error.js");
require("dotenv").config({ path: "./.env" });
const path = require("path");

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Routes Imports
const customerRouter = require("./routes/customerRouter.js");
const adminRouter = require("./routes/adminRouter.js");
const productRouter = require("./routes/productRouter.js");
const subscriptionRouter = require("./routes/subscriptionRouter.js");
const subscriptionPlanRouter = require("./routes/subscriptionPlanRouter.js");
// const orderRouter = require("./routes/orderRouter.js");
const stripePaymentRouter = require('./routes/stripesPaymentRouter.js');
// const stripeWebhookRouter = require('./routes/webhookrouter.js');

//routes declaration
app.use("/api/v1/customer", customerRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/subscription_plan", subscriptionPlanRouter);
app.use("/api/v1/stripe", stripePaymentRouter);
// app.use("/api/stripe/webhook", stripeWebhookRouter);
// app.use("/success", orderRouter);

// Middleware for error
app.use(errorMiddleware);

module.exports = app;
