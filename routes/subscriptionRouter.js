const express = require("express");
const router = express.Router();
const {authenticate,authorize}=require('../middlewares/auth');
const {createSubscription} =require('../controllers/subscriptionController')
const {validateSubscriptionPlanCreation} = require('../utils/validation');

router.post('/createSubscription',authenticate,authorize(['ADMIN']),validateSubscriptionPlanCreation,createSubscription);


module.exports = router;