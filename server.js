require("dotenv").config();

const express = require("express");
const next = require("next");
const mysql = require("mysql2/promise");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const bodyParser = require('body-parser');

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const s3Service = require("./s3Service");

// Express 서버 초기화
const server = express();
server.use(bodyParser.json());

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
};

app.prepare().then(() => {
	// DB에서 물품 정보 다 가져오기
	server.get("/api/products", async (req, res) => {
		let connection;
		try {
			// MySQL 데이터베이스에 연결
			connection = await mysql.createConnection(dbConfig);

			// 모든 제품 가져오는 쿼리 실행
			const [rows] = await connection.execute("SELECT * FROM products");

			// JSON 응답으로 데이터 반환
			return res.json(rows);
		} catch (error) {
			console.error("DB 연결/쿼리 오류:", error);
			return res.json(
				{ error: "Database connection failed" },
				{ status: 500 }
			);
		} finally {
			// 연결 종료
			if (connection) await connection.end();
		}
	});

	// S3에 이미지 올리고 url 받기
	server.post(
		"/api/upload-to-s3",
		upload.single("file"),
		async (req, res) => {
			try {
				const file = req.file; // 업로드된 파일 가져오기
				if (!file) {
					return res.status(400).json({ error: "No file uploaded" });
				}

				// S3 업로드 설정
				const params = {
					Bucket: process.env.S3_BUCKET_NAME,
					Key: `productImages/${Date.now()}_${file.originalname}`, // 파일 이름을 현재 시간과 원본 이름으로 설정
					Body: file.buffer, // 파일 데이터
					ACL: "public-read", // 퍼블릭 읽기 권한
					ContentType: file.mimetype, // 파일 MIME 타입
				};

				// S3에 파일 업로드
				const result = await s3Service.uploadFile(params);

				// 업로드 성공 시 파일의 URL 반환
				res.status(200).json({ url: result.Location });
			} catch (error) {
				console.error("Error uploading to S3:", error);
				res.status(500).json({ error: "Failed to upload image" });
			}
		}
	);

	// 제품 정보 추가 API
	server.post('/api/products', async (req, res) => {
	let connection;
	try {
	  // 요청 본문에서 데이터 파싱
	  const { name, description, image_url, price } = req.body;

	  console.log(name,description,image_url,price)
  
	  // 필수 값 검증
	  if (!name || !description || !image_url || !price) {
		return res.status(400).json({
		  error: 'All fields (name, description, image_url, price) are required.',
		});
	  }
  
	  // MySQL 데이터베이스에 연결
	  connection = await mysql.createConnection(dbConfig);
  
	  // 쿼리 작성
	  const insertQuery = `
      INSERT INTO products (name, description, image_url, price)
      VALUES (?, ?, ?, ?)
    `;

    // 쿼리 실행
    await connection.execute(insertQuery, [name, description, image_url, price]);
  
	  // 성공적인 응답 반환
	  res.status(201).json({ message: 'Product added successfully' });
	} catch (error) {
	  console.error('DB 연결/쿼리 오류:', error);
	  res.status(500).json({ error: 'Database connection failed' });
	} finally {
	  // 연결 종료
	  if (connection) await connection.end();
	}
  });

	// Next.js 페이지 핸들링
	server.all("*", (req, res) => {
		return handle(req, res);
	});

	// 서버 시작
	const port = 3000;
	server.listen(port, (err) => {
		if (err) throw err;
		console.log(`Server is running on http://localhost:${port}`);
	});
});
