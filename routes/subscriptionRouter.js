const express = require("express");
const router = express.Router();
const {authenticate,authorize}=require('../middlewares/auth');
const {createOrUpdateSubscription} =require('../controllers/subscriptionController')
const {validateSubscriptionPlanCreation} = require('../utils/validation');

router.post('/createSubscription',authenticate,authorize(['ADMIN']),validateSubscriptionPlanCreation,createOrUpdateSubscription);


module.exports = router;