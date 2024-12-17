const express = require('express');
const openaiRoutes = require('./openai');
const productRoutes = require('./products');
const reviews = require('./reviews');

const router = express.Router();

// 라우트 등록
router.use('/openai', openaiRoutes);
router.use('/products', productRoutes);
router.use('/reviews', reviews);

router.get('/api-key', (req, res) => {
  // 여기에 실제 API 키 생성 로직 추가
  const apiKey = '1234-5678-ABCD-EFGH';

  res.json({ apiKey });
});
module.exports = router;
