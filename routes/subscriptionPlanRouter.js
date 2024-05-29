const express = require("express");
const router = express.Router();
const {authenticate,authorize}=require('../middlewares/auth');
const {createSubscriptionPlan,subsFindAll,subsFindOne,FindByFrequency} =require('../controllers/subscriptionPlanController')
const {validateSubscriptionPlanCreation} = require('../utils/validation');

router.post('/createSubsPlan',authenticate,authorize(['ADMIN']),validateSubscriptionPlanCreation,createSubscriptionPlan);
router.get('/getAllSubsplan',authenticate,authorize(['ADMIN','CUSTOMER']),subsFindAll)
router.get('/getByIdSubsplan/:id',authenticate,authorize(['ADMIN','CUSTOMER']),subsFindOne)
router.get('/getByFrequency',FindByFrequency)
module.exports = router;