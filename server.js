require("dotenv").config();
const express = require("express");
const next = require("next");
const mysql = require("mysql2/promise");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const bodyParser = require("body-parser");
const OpenAI = require("openai");

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

const openai = new OpenAI({
	apiKey: process.env.OPEN_API_KEY,
});

app.prepare().then(() => {
	// DB에서 모든 제품 가져오기
	server.get("/api/products", async (req, res) => {
		let connection;
		try {
			connection = await mysql.createConnection(dbConfig);
			const [rows] = await connection.execute("SELECT * FROM products");
			return res.json(rows);
		} catch (error) {
			console.error("DB 연결/쿼리 오류:", error);
			return res
				.status(500)
				.json({ error: "Database connection failed" });
		} finally {
			if (connection) await connection.end();
		}
	});

	// 특정 제품 정보 가져오기
	server.get("/api/products/:id", async (req, res) => {
		let connection;
		try {
			connection = await mysql.createConnection(dbConfig);
			const id = req.params.id;
			const row = await connection.execute(
				"SELECT * FROM products WHERE id = ?",
				[id]
			);
			console.log(row);
			return res.json(row);
		} catch (error) {
			console.error("DB 연결/쿼리 오류:", error);
			return res
				.status(500)
				.json({ error: "Database connection failed" });
		} finally {
			if (connection) await connection.end();
		}
	});

	// S3에 이미지 업로드 API
	server.post(
		"/api/upload-to-s3",
		upload.single("file"),
		async (req, res) => {
			try {
				const file = req.file;
				if (!file) {
					return res.status(400).json({ error: "No file uploaded" });
				}
				const params = {
					Bucket: process.env.S3_BUCKET_NAME,
					Key: `productImages/${Date.now()}_${file.originalname}`,
					Body: file.buffer,
					ACL: "public-read",
					ContentType: file.mimetype,
				};
				const result = await s3Service.uploadFile(params);
				res.status(200).json({ url: result.Location });
			} catch (error) {
				console.error("Error uploading to S3:", error);
				res.status(500).json({ error: "Failed to upload image" });
			}
		}
	);

	// 제품 정보 추가 API
	server.post("/api/products", async (req, res) => {
		let connection;
		try {
			const { name, description, image_url, price } = req.body;
			if (!name || !description || !image_url || !price) {
				return res.status(400).json({
					error: "All fields (name, description, image_url, price) are required.",
				});
			}
			connection = await mysql.createConnection(dbConfig);
			const insertQuery = `
                INSERT INTO products (name, description, image_url, price)
                VALUES (?, ?, ?, ?)
            `;
			await connection.execute(insertQuery, [
				name,
				description,
				image_url,
				price,
			]);
			res.status(201).json({ message: "Product added successfully" });
		} catch (error) {
			console.error("DB 연결/쿼리 오류:", error);
			res.status(500).json({ error: "Database connection failed" });
		} finally {
			if (connection) await connection.end();
		}
	});

	// OpenAI 리뷰 생성 API
	server.post("/api/openai/review", async (req, res) => {
		const productDescription = req.body.desc;

		const prompt = `
            제품 설명을 읽고, 제품의 유형을 추측한 후 주요 특징을 뽑아내세요. 
            그 특징들을 바탕으로 전문 용어를 피하고 일상적이고 쉬운 표현으로 작성된 
            질문 5개와 전체적인 만족도를 물어보는 질문 2개를 만들어, 배열에 담아 반환하세요.
            반환되는 배열의 변수명은 'questions'이어야 하며, 다른 설명 없이 오직 'questions' 배열만 반환하세요.
            각 질문은 자연스럽게 작성된 한글 질문이어야 하고, 기술 이름이나 브랜드 이름이 들어가서는 안됩니다.

            제품 설명:
            ${productDescription}
        `;

		try {
			const completion = await openai.chat.completions.create({
				model: "gpt-4o",
				messages: [
					{
						role: "system",
						content:
							"너는 제품 설명을 바탕으로 주요 특징을 분석하고, 사용자가 제품을 사용하고 이용후기를 간단하게 적을 수 있도록 질문을 최대한 간단하게 만들어주는 AI이다.",
					},
					{ role: "user", content: prompt },
				],
			});

			const responseContent = completion.choices[0].message.content;

			const match = responseContent.match(
				/questions\s*=\s*(\[[\s\S]*?\])/
			);

			if (match && match[1]) {
				// eval()을 사용하여 배열로 변환 (보안상 주의)
				const questions = eval(match[1]); // 보안 문제로 안전한 환경에서만 사용

				// 추출한 questions 배열을 클라이언트에 반환
				res.json({ questions });
			} else {
				res.status(500).json({
					error: "questions 배열을 추출할 수 없습니다.",
				});
			}
		} catch (error) {
			console.error("OpenAI API 호출 오류:", error);
			res.status(500).json({
				error: "Failed to generate review questions",
			});
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
