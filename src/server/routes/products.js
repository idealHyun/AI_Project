const express = require('express');
const { getProduct,getProducts,createProduct } = require('../controllers/productsController');

const router = express.Router();

router.get('/', getProducts); // GET /api/products
router.get('/:id', getProduct); // GET /api/products/:id
router.post('/',createProduct) // POST /api/products

module.exports = router;