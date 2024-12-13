const mysql = require("mysql2/promise");

// 데이터베이스 설정
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// API Key 검증 미들웨어
const validateApiKey = async (req, res, next) => {
  let connection;

  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    const apiKey = req.headers["api_key"]; // 헤더에서 api_key 추출

    if (!apiKey) {
      return res.status(400).json({ error: "API Key is missing" });
    }

    // API Key 검증 쿼리 실행
    const query = "SELECT COUNT(*) AS count FROM api_keys WHERE `key` = ?";
    const [rows] = await connection.execute(query, [apiKey]);

    if (rows[0].count === 0) {
      return res.status(403).json({ error: "Invalid API Key" });
    }

    // 유효한 API Key라면 다음 미들웨어로
    next();
  } catch (error) {
    console.error("Error validating API Key:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // 데이터베이스 연결 해제
    if (connection) {
      await connection.end();
    }
  }
};

module.exports = validateApiKey;
