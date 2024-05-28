const express = require("express");
const router = express.Router();
const {authenticate,authorize}=require('../middlewares/auth');
const {createProduct,findAllWithSubscriptionPlans,findAllProduct,findOneProduct,updateProduct,deleteProduct} =require('../controllers/productController')
const {productValidation,validateProductUpdate} = require('../utils/validation');

router.post('/createProduct',authenticate,authorize(['ADMIN']),productValidation,createProduct);
router.get('/with-subscription-plans',authenticate,authorize(['ADMIN','CUSTOMER']), findAllWithSubscriptionPlans);
// Retrieve a single Product with id
router.get('getOne/:id',authenticate,authorize(['ADMIN']), findOneProduct);

// Update a Product with id
router.put('update/:id',authenticate,authorize(['ADMIN']), validateProductUpdate,updateProduct);

// Delete a Product with id
router.delete('delete/:id',authenticate,authorize(['ADMIN']), deleteProduct);

module.exports = router;