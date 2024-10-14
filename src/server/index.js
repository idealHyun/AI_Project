require("dotenv").config();
const express = require("express");
const next = require("next");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const bodyParser = require("body-parser");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const s3Service = require("./utils/s3Service");
const routes = require('./routes');

// Express 서버 초기화
const server = express();
server.use(bodyParser.json());

app.prepare().then(() => {

	server.use('/api', routes);

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
