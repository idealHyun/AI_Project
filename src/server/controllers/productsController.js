const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// 모든 제품 정보 가져오기
const getProducts = async (req, res) => {
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

// id로 제품 정보 가져오기
const getProduct = async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const id = req.params.id;
    const row = await connection.execute(
      'SELECT * FROM products WHERE id = ?',
      [id],
    );
    return res.json(row);
  } catch (error) {
    console.error('DB 연결/쿼리 오류:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  } finally {
    if (connection) await connection.end();
  }
};

// 제품 정보 추가 API
const createProduct = async (req, res) => {
  let connection;
  try {
    const { name, description, image_url, price, features, category } =
      req.body;
    if (!name || !description || !image_url || !price) {
      return res.status(400).json({
        error:
          'All fields (name, description, image_url, price, features, category) are required.',
      });
    }
    connection = await mysql.createConnection(dbConfig);
    const insertQuery = `
                INSERT INTO products (name, description, image_url, price, features, category)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
    await connection.execute(insertQuery, [
      name,
      description,
      image_url,
      price,
      features,
      category,
    ]);
    res.status(201).json({ message: '물품이 등록되었습니다.' });
  } catch (error) {
    console.error('DB 연결/쿼리 오류:', error);
    res.status(500).json({ error: 'DB 연결 오류' });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = { getProduct, getProducts, createProduct };
