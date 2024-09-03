const db = require("../db/dbConnection");
const Transaction = db.transactions;
const Order=db.orders;

// create transaction
const createTransaction = async (data) => {
    try {
        // Find the order using the payment_intent
        const order = await Order.findOne({ where: { 'payment.intentId': data.payment_intent } });
console.log(data.payment_intent);
        if (!order) {
            return resizeBy.status(400).send({status:false,message:'Order not found for the given payment intent'});
        }

        // Create the transaction with the orderId
        const transaction = await Transaction.create({
            orderId: order.id,
            amount: data.amount_total / 100,
            currency: data.currency,
            method: data.payment_method_types,
            status: data.payment_status,
            paymentDetails: {
                intentId: data.payment_intent,
                status: data.payment_status,
                amount: data.amount_total / 100,
                currency: data.currency,
                method: data.payment_method_types[0],
            }
        });

        console.log('Transaction created successfully:', transaction);
        return res.status(201).send({status:true,message:transaction});
    } catch (error) {
        console.error('Error creating transaction:', error);
        return res.status(500).send({status:false,message:error.message||'Error creating transaction'});
    }
};

module.exports = {
    createTransaction,
};