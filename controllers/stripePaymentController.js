const Stripe = require('stripe');
const dotenv = require('dotenv').config();
const asyncHandler = require('../utils/asyncHandler');
const errorHandler = require('../utils/errorHandler');
const { json } = require('sequelize');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const stripePayment = asyncHandler(async (req, res, next) => {
    // const customer = await stripe.customers.create({
    //     metadata:{
    //         userId:req.body.userId,
    //         planName:req.body.planName,
    //         frequency:req.body.frequency,
    //         planPrice:req.body.planPrice
    //     }
    // })
    // console.log("hello line 19",customer);
  try {
    const {
      userName,
      planName,
      description,
      frequency,
      userId,
      planPrice,
      features,
      accessToken,
    } = req.body;

    if (
      !userName ||
      !planName ||
      !description ||
      !frequency||
      !userId ||
      !planPrice ||
      !features ||
      !accessToken
    ) {
      return next(new errorHandler('Missing required fields', 400));
    }

    if (!Array.isArray(features) || features.length === 0) {
      return next(new errorHandler('Features must be a non-empty array', 400));
    }

    if (typeof planPrice !== 'number' || planPrice <= 0) {
      return next(new errorHandler('Plan price must be a positive number', 400));
    }

    const featuresString = features.join(', ');

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      payment_method_types: ['card'],
      customer_email: req.body.userName,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName,
              description: `${description} - ${featuresString}`,
            },
            unit_amount: planPrice * 100,
          },
          quantity: 1,
        },
      ],
      invoice_creation: {
        enabled: true,
      },
      metadata: {
        planName: planName,
        frequency:frequency,
        features:featuresString,
        userId: userId,
      },
      // customer:customer.id,
      mode: 'payment',
      success_url: `https://new-video-editor.vercel.app/listings?session_id={CHECKOUT_SESSION_ID}&accessToken=${accessToken}`,
      cancel_url: 'https://subscription-saa-s-ui.vercel.app/',
    });
    console.log("session leke aaya hu",session);
    res.send({ url: session.url });
  } catch (error) {
    console.error('Stripe payment error:', error);

    if (error.type === 'StripeCardError') {
      return next(new errorHandler(error.message, 400));
    }

    return next(
      new errorHandler(
        error.message ||
          'Some error occurred while creating the Stripe session.',
        500
      )
    );
  }
});

const getSessionDetails = asyncHandler(async (req, res, next) => {
  try {
    const session_id = req.query.session_id;

    if (!session_id) {
      return next(new errorHandler('Session ID is required', 400));
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return next(new errorHandler('Session not found', 404));
    }

    console.log(session.metadata);
    res.send(session);
  } catch (error) {
    console.error('Error fetching session details:', error);
    return next(new errorHandler('Error fetching session details', 500));
  }
});

module.exports = {
  stripePayment,
  getSessionDetails
};
