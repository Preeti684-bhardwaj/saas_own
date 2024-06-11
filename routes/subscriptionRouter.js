const express = require("express");
const router = express.Router();
const {authenticate,authorize}=require('../middlewares/auth');
// const {createSubscription} =require('../controllers/subscriptionController')
const {getSubscription}=require('../controllers/subscriptionController')
// const {validateSubscriptionPlanCreation} = require('../utils/validation');

// router.post('/createSubscription',authenticate,authorize(['ADMIN']),validateSubscriptionPlanCreation,createSubscription);
router.get('/getSubscription',authenticate,authorize(['ADMIN','CUSTOMER']),getSubscription)


module.exports = router;