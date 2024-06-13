const db = require('../db/dbConnection');
const Subscription = db.subscriptions;
const Customer=db.customers;
const calculateEndDate = require('../utils/endDateConfigure');
const asyncHandler = require('../utils/asyncHandler');

// stripe webhook data of subscription of customer
const createSubscription = async (userId, frequency ,plan, price) => {
  const transaction = await db.sequelize.transaction();
  try {
    const startDate = new Date();
    const endDate = calculateEndDate(startDate, frequency);

    const subscription = await Subscription.create({
      customerId:userId,
      frequency,
      plan,
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
};

const getSubscription = asyncHandler(async (req, res) => {
  // const accessToken = req.params.accessToken; // Extract token from header
  const userId = req.body.userId;
// console.log(accessToken);
  // if (!accessToken) {
  //   return res.status(401).json({ message: "Access token is missing" });
  // }

  if (!userId) {
    return res.status(400).json({ message: "User ID is missing" });
  }

  try {
    // Assuming you have a middleware to verify the access token
    // and attach user info to the request object
    // e.g., req.user = { id: verifiedUserId };

    // Fetch the subscription from the database
    const subscription = await Subscription.findAll({
      where: { customerId: userId }
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: "Server error" });
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
const FindBysubscriptions = async (req, res) => {
  // const { userId} = req.query; // Extract frequency from request body
console.log(req.decodedToken.obj.obj.id);
  try {
    const subscriptions = await Customer.findAll({
      where: {
        id: req.decodedToken.obj.obj.id
      },
      attributes: { exclude: ['password'] }, 
      include: [
        {
          model: db.subscriptions,
          as: "subscriptions", // Use the correct association alias
        },
      ],
    });
console.log(subscriptions);
    if (subscriptions.length > 0) {
      res.status(200).send(subscriptions);
    } else {
      res.status(404).send({
        message: `Cannot find any Subscription with userId.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving Subscription  with userId",
      error: error.message
    });
  }
};

module.exports = {
  createSubscription,
  getSubscription,
  FindBysubscriptions
};
