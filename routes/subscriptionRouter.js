const express = require("express");
const router = express.Router();
const {authenticate,authorize}=require('../middlewares/auth');
// const {createSubscription} =require('../controllers/subscriptionController')
// const {getSubscription}=require('../controllers/subscriptionController')
const {FindBysubscriptions}=require('../controllers/subscriptionController')
// const {validateSubscriptionPlanCreation} = require('../utils/validation');

// router.post('/createSubscription',authenticate,authorize(['ADMIN']),validateSubscriptionPlanCreation,createSubscription);
// router.get('/getSubscription',authenticate,authorize(['ADMIN','CUSTOMER']),getSubscription)
router.get('/getCustomerSubscription',authenticate,authorize(['ADMIN','CUSTOMER']),FindBysubscriptions)

module.exports = router;