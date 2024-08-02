const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/error.js");
require("dotenv").config({ path: "./.env" });
const app = express();
const cors = require('cors');
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
};
app.use(cors(corsOptions)); // Preflight requests
// app.options('*', cors(corsOptions));
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Routes Imports
const customerRouter = require("./routes/customerRouter.js");
const adminRouter = require("./routes/adminRouter.js");
const productRouter = require("./routes/productRouter.js");
const subscriptionRouter = require("./routes/subscriptionRouter.js");
const subscriptionPlanRouter = require("./routes/subscriptionPlanRouter.js");
const orderRouter = require("./routes/orderRouter.js");
const cashfreePaymentRouter = require("./routes/cashfreePaymentRouter.js");
// const stripeWebhookRouter = require('./routes/webhookrouter.js');

//routes declaration
app.use("/api/v1/customer", customerRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/subscription_plan", subscriptionPlanRouter);
app.use("/api/v1/cashfree", cashfreePaymentRouter);
// app.use("/api/stripe/webhook", stripeWebhookRouter);
app.use("/api/v1/order", orderRouter);

// Middleware for error
app.use(errorMiddleware);

module.exports = app;
