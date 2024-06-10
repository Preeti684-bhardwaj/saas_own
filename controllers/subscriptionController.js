const db = require('../db/dbConnection');
const Subscription = db.subscriptions
const calculateEndDate = require('../utils/endDateConfigure');
const asyncHandler = require('../utils/asyncHandler');

// stripe webhook data of subscription of customer
const createSubscription = asyncHandler(async (userId, frequency , price) => {
  const transaction = await db.sequelize.transaction();
  try {
    const startDate = new Date();
    const endDate = calculateEndDate(startDate, frequency);

    const subscription = await Subscription.create({
      customerId:userId,
      frequency,
      // status: 'active',
      startDate,
      endDate,
      price:price/100,
    },{transaction});

    await transaction.commit();
    console.log('Subscription created or updated successfully:', subscription);
    return subscription;
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating or updating subscription:', error);
    throw new Error('Error creating or updating subscription');
  }
});

// subscription through other way
// const createSubscription = asyncHandler(async (req, res, next) => {
  //     const { customerId, subscriptionPlanId, startDate, endDate } = req.body;

  //     if (!customerId || !subscriptionPlanId) {
    //         return next(new errorHandler("Customer ID and Subscription Plan ID are required", 400));
//     }

//     try {
//         const customer = await Customer.findByPk(customerId);
//         const plan = await SubscriptionPlan.findByPk(subscriptionPlanId);

//         if (!customer || !plan) {
//             return next(new errorHandler("Customer or Subscription Plan not found", 404));
//         }

//         const subscription = await Subscription.create({
  //             customerId,
  //             subscriptionPlanId,
  //             startDate: startDate || new Date(),
  //             endDate: endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  //             status: 'active'
  //         });
  
  //         res.status(201).json(subscription);
  //     } catch (error) {
//         console.error("Error creating subscription:", error);
//         return next(new errorHandler("Error creating subscription", 500));
//     }
// });

module.exports = {
  createSubscription,
};
