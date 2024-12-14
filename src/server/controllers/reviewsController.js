const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// 특정 제품 리뷰 가져오기
const getProductReview = async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM products');
    return res.json(rows);
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
    const product_id = req.body.productId; // 클라이언트에서 보낸 데이터
    const comment = req.body.comment;

    // 리뷰를 삽입하는 쿼리 실행
    await connection.execute(
      'INSERT INTO reviews (product_id, comment) VALUES (?, ?)',
      [product_id, comment],
    );

    // 삽입 결과를 확인하거나 필요하면 반환
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
