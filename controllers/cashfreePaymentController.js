const { Cashfree } = require("cashfree-pg");
const dotenv = require("dotenv").config();
const asyncHandler = require("../utils/asyncHandler");
const errorHandler = require("../utils/errorHandler");
const axios = require("axios");
const { XClientId, XClientSecret, API_Version, API_URL } = process.env;

const cashfreePayment = asyncHandler(async (req, res, next) => {
  try {
    const {
      orderId,
      userName,
      phone,
      userId,
      planPrice,
    } = req.body;

    if (
      !orderId ||
      !userName ||
      !phone ||
      !userId ||
      !planPrice
    ) {
      return next(new errorHandler("Missing required fields", 400));
    }
    if (typeof planPrice !== "number" || planPrice <= 0) {
      return next(
        new errorHandler("Plan price must be a positive number", 400)
      );
    }
    const option = {
      method: "POST",
      url: API_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "x-api-version": API_Version,
        "x-client-id": XClientId,
        "x-client-secret": XClientSecret,
      },
      data: {
        order_amount: planPrice * 100,
        order_currency: "INR",
        order_id: orderId,
        customer_details: {
          customer_id: userId,
          customer_phone: phone,
          // "customer_name": userName,
          customer_email: userName,
        },
        order_meta: {
          // return_url:
          //   "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}",
          notify_url:
            "https://webhook.site/3a7007c2-c21e-4871-b275-e13979f3a115",
          payment_methods:
            "cc,dc,ppc,ccc,emi,paypal,upi,nb,app,paylater",
        },
      },
    };
    axios
      .request(option)
      .then((response) => {
        res.status(200).send({ status: true, data: response.data.payment_session_id});
        console.log("Order created successfully:", response.data);
      })
      .catch((error) => {
        console.error(
          "Error:",
          error.response ? error.response.data.message : error.message
        );
      });
  } catch (error) {
    console.error("Stripe payment error:", error);

    if (error.type === "StripeCardError") {
      return next(new errorHandler(error.message, 400));
    }

    return next(
      new errorHandler(
        error.message ||
          "Some error occurred while creating the Stripe session.",
        500
      )
    );
  }
});

const getStatus=asyncHandler(async(req,res,next)=>{
  const orderId=req.params.order_id
   console.log(orderId);
  try{
    const options={
      method:'GET',
      url:`https://sandbox.cashfree.com/pg/orders/${orderId}`,
      headers:{
        accept: "application/json",
        "Content-Type": "application/json",
        "x-api-version": API_Version,
        "x-client-id": XClientId,
        "x-client-secret": XClientSecret
      }
    };
    axios
    .request(options)
    .then((response)=>{
      console.log(response.data);
      const accessToken = req.params.accessToken; // Assuming the access token is in the authorization header

      // Set the access token as a cookie
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
        sameSite: 'None', // For cross-site cookie
        domain:'.new-video-editor.vercel.app'
      });
      if(response.data.order_status==="PAID"){
        return res.status(301).redirect('https://new-video-editor.vercel.app/listings')
      }else if(response.data.order_status==="ACTIVE"){
        return res.status(301).redirect(`http://localhost:3000/${response.data.payment_session_id}`)
      }else{
        return res.status(400).redirect('https://aiengage.xircular.io/failure')
      }
    })
    .catch((error)=>{
      return console.error(error);
    })
  }catch(error){
   res.status(500).send({status:false,message:error.message})
  }
})

// get session detail
const getSessionDetails = asyncHandler(async (req, res, next) => {
  try {
    const session_id = req.query.session_id;

    if (!session_id) {
      return next(new errorHandler("Session ID is required", 400));
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return next(new errorHandler("Session not found", 404));
    }

    console.log(session.metadata);
    res.send(session);
  } catch (error) {
    console.error("Error fetching session details:", error);
    return next(new errorHandler("Error fetching session details", 500));
  }
});

module.exports = {
  cashfreePayment,
  getStatus,
  getSessionDetails,
};
