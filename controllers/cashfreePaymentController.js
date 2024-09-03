const { Cashfree } = require("cashfree-pg");
const dotenv = require("dotenv").config();
const asyncHandler = require("../utils/asyncHandler");
// const errorHandler = require("../utils/errorHandler");
const axios = require("axios");
const { XClientId, XClientSecret, API_Version, API_URL } = process.env;

const cashfreePayment = asyncHandler(async (req, res) => {
  try {
    const {
      orderId,
      userName,
      phone,
      name,
      userId,
      planPrice
    } = req.body;

    if (
      !orderId ||
      !userName ||
      !phone ||
      !name ||
      !userId ||
      !planPrice
    ) {
      return res.status(400).send({status:false,message:"Missing required fields"})
    }
    if (typeof planPrice !== "number" || planPrice <= 0) {
      returnres.status(400).send({status:false,message:"Plan price must be a positive number"}
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
        order_amount: planPrice ,
        order_currency: "INR",
        order_id: orderId,
        customer_details: {
          customer_id: userId,
          customer_phone: phone,
          customer_name: name,
          customer_email: userName
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
      return res.status(400).send({status:false,message:error.message});
    }

    return  res.status(500).send({status:false,message:
        error.message ||
          "Some error occurred while creating the Stripe session.",
    });
  }
});

const getStatus = asyncHandler(async (req, res) => {
  // let token = req.cookies.access_token;
  const orderId = req.params.order_id;
  console.log(orderId);
  
  try {
    const options = {
      method: 'GET',
      url: `https://sandbox.cashfree.com/pg/orders/${orderId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "x-api-version": API_Version,
        "x-client-id": XClientId,
        "x-client-secret": XClientSecret ,// Use the access token in the request headers
      },
      // Credential:true
    };

    const response = await axios.request(options);
    console.log(response.data);

    if (response.data.order_status === "PAID") {
      // console.log(req.cookies);
      // let token = req.cookies.access_token;
      return res.status(301).redirect(`https://new-video-editor.vercel.app/listings`); //?accessToken=${token}
    } else if (response.data.order_status === "ACTIVE") {
      return res.status(301).redirect(`https://aiengage.xircular.io/${response.data.payment_session_id}`);
    } else {
      return res.status(400).redirect('https://aiengage.xircular.io/failure');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: false, message: error.message });
  }
});

// get session detail
const getSessionDetails = asyncHandler(async (req, res) => {
  try {
    const session_id = req.query.session_id;

    if (!session_id) {
      return res.status(400).send({status:false,message: "Session ID is required"});
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res.status(404).send({status:false,message:"Session not found"});
    }

    console.log(session.metadata);
    res.send(session);
  } catch (error) {
    console.error("Error fetching session details:", error);
    return res.status(500).send({status:false,message:error.message|| "Error fetching session details"});
  }
});

module.exports = {
  cashfreePayment,
  getStatus,
  getSessionDetails,
};
