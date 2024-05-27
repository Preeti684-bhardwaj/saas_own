const express = require("express");
const router = express.Router();
const {authenticate,authorize}=require('../middlewares/auth');
const {createProduct,findAllWithSubscriptionPlans} =require('../controllers/productController')
const {productValidation} = require('../utils/validation');

router.post('/createProduct',authenticate,authorize(['ADMIN']),productValidation,createProduct);
router.get('/with-subscription-plans',authenticate,authorize(['ADMIN','CUSTOMER']), findAllWithSubscriptionPlans);

module.exports = router;