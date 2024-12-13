const express = require('express');
const openaiRoutes = require('./openai');
const productRoutes = require('./products');

const router = express.Router();

// 라우트 등록
router.use('/openai', openaiRoutes);
router.use('/products', productRoutes);

router.get('/api-key', (req, res) => {
  const apiKey = '1234-5678-ABCD-EFGH'; // 여기에 실제 API 키 생성 로직 추가 가능
  res.json({ apiKey });
});
module.exports = router;
