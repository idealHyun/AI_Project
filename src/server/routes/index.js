const express = require('express');
const openaiRoutes = require('./openai');
const productRoutes = require('./products');

const router = express.Router();

// 라우트 등록
router.use('/openai', openaiRoutes);
router.use('/products', productRoutes);

module.exports = router;