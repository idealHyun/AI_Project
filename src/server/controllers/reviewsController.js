const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbconfig.js');

// 특정 제품 리뷰 가져오기
const getProductReview = async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // req.params에서 product_id를 동적으로 추출
    const product_id = req.params.id;

    // 리뷰 조회하는 쿼리 실행
    const [rows] = await connection.execute(
      'SELECT * FROM products.reviews WHERE reviews.product_id = ?',
      [product_id],
    );

    return res.json(rows); // 조회된 리뷰 데이터 반환
  } catch (error) {
    console.error('DB 연결/쿼리 오류:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  } finally {
    if (connection) await connection.end();
  }
};

// 특정 제품 리뷰 생성하기
const createProductReview = async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const product_id = req.body.productId;
    const comment = req.body.comment;

    // 리뷰 생성하는 쿼리 실행
    await connection.execute(
      'INSERT INTO reviews (product_id, comment) VALUES (?, ?)',
      [product_id, comment],
    );

    return res.status(201).json({
      message: 'Review created successfully',
    });
  } catch (error) {
    console.error('DB 연결/쿼리 오류:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = { getProductReview, createProductReview };
