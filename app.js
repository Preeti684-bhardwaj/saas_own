const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/error.js");
require("dotenv").config({ path: "./.env" });
const app = express();
const cors = require("cors");
app.use(cookieParser());
const allowedOrigins =['https://aiengage.xircular.io','https://new-video-editor.vercel.app','http://localhost:3000',undefined ]

app.use(cors({
  origin: (origin, callback) => {
    console.log("Incoming request origin:", origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Origin not allowed:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Enable this to allow cookies and authentication headers
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// After CORS middleware, add this to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Request headers:', req.headers);
  next();
});
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
