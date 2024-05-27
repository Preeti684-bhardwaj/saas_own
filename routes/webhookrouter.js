// const express = require('express');
// const router = express.Router();
// const bodyParser = require('body-parser');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const { Order} = require('../models/orderModel');
// const { Transaction } = require('../models/transactionModel');
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// router.post('/hook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
//     const sig = req.headers['stripe-signature'];

//     let event;

//     try {
//         event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//         console.log("webhook verified",event);
//     } catch (err) {
//         console.error(`⚠️  Webhook signature verification failed.`, err.message);
//         return res.sendStatus(400);
//     }

//     const session = event.data.object;

//     switch (event.type) {
//         case 'checkout.session.completed':
//             await handleCheckoutSessionCompleted(session);
//             break;
//         case 'payment_intent.payment_failed':
//             await handlePaymentIntentFailed(session);
//             break;
//         case 'payment_intent.succeeded':
//             await handlePaymentIntentSucceeded(session);
//             break;
//         default:
//             console.log(`Unhandled event type ${event.type}`);
//     }

//     res.status(200).send('Received');
// });

// // async function handleCheckoutSessionCompleted(session) {
// //     const transaction = await Transaction.create({
// //         id: session.payment_intent,
// //         status: 'completed',
// //         amount: session.amount_total,
// //         currency: session.currency,
// //         orderId: session.client_reference_id,
// //         createdAt: new Date(),
// //         updatedAt: new Date()
// //     });

// //     await Order.update({
// //         status: 'completed',
// //         payment: session
// //     }, {
// //         where: { id: session.client_reference_id }
// //     });

// //     console.log('Transaction and Order created successfully');
// // }

// // async function handlePaymentIntentFailed(session) {
// //     await Transaction.update(
// //         { status: 'failed' },
// //         { where: { id: session.payment_intent } }
// //     );

// //     await Order.update(
// //         { status: 'failed' },
// //         { where: { id: session.client_reference_id } }
// //     );

// //     console.log('Transaction and Order updated to failed status');
// // }

// // async function handlePaymentIntentSucceeded(session) {
// //     await Transaction.update(
// //         { status: 'succeeded' },
// //         { where: { id: session.payment_intent } }
// //     );

// //     await Order.update(
// //         { status: 'succeeded' },
// //         { where: { id: session.client_reference_id } }
// //     );

// //     console.log('Transaction and Order updated to succeeded status');
// // }

// module.exports = router;
