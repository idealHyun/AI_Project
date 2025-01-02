const express = require('express');
const router = express.Router();
const openaiRoutes = require('./openai');
const productRoutes = require('./products');
const reviews = require('./reviews');
const dbConfig = require('../config/dbconfig');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

// 라우트 등록
router.use('/openai', openaiRoutes);
router.use('/products', productRoutes);
router.use('/reviews', reviews);

router.get('/api-key', async (req, res) => {
  try {
    const apiKey = crypto.randomBytes(16).toString('hex'); // 32자리 랜덤 키 생성

    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'INSERT INTO products.api_keys (`key`) VALUES (?);',
      [apiKey],
    );

    if (result.affectedRows === 1) {
      res.json({ apiKey });
    } else {
      throw new Error('API 키 저장에 실패했습니다.');
    }

    await connection.end();
  } catch (error) {
    console.error('Error generating API key:', error);
    res
      .status(500)
      .json({ success: false, message: 'API 키 생성 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
