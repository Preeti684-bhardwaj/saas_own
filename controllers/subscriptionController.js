const { Subscription} = require('../models/subscriptionModel');
const {SubscriptionPlan} =require ('../models/subscriptionPlanModel');
const {Customer} =require ('../models/customerModel')
const asyncHandler = require('../utils/asyncHandler');
const errorHandler = require('../utils/errorHandler');

const createSubscription = asyncHandler(async (req, res, next) => {
    const { customerId, subscriptionPlanId, startDate, endDate } = req.body;

    if (!customerId || !subscriptionPlanId) {
        return next(new errorHandler("Customer ID and Subscription Plan ID are required", 400));
    }

    try {
        const customer = await Customer.findByPk(customerId);
        const plan = await SubscriptionPlan.findByPk(subscriptionPlanId);

        if (!customer || !plan) {
            return next(new errorHandler("Customer or Subscription Plan not found", 404));
        }

        const subscription = await Subscription.create({
            customerId,
            subscriptionPlanId,
            startDate: startDate || new Date(),
            endDate: endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            status: 'active'
        });

        res.status(201).json(subscription);
    } catch (error) {
        console.error("Error creating subscription:", error);
        return next(new errorHandler("Error creating subscription", 500));
    }
});

module.exports = {
    createSubscription
};
