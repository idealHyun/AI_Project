const OpenAI = require("openai");

const openai = new OpenAI({
	apiKey: process.env.OPEN_API_KEY,
});

// OpenAI 제품군과 제품 특징 뽑는 API
const createFeatures = async (req, res) => {
	const productDescription = req.body.desc;

	const prompt = `
        제품 설명을 읽고, 제품의 유형을 추측한 후 제품 유형에 맞게 주요 특징을 뽑아내세요.  
        그 특징들을 바탕으로 전문 용어를 피하고 일상적이고 쉬운 표현으로 나타내어야되며, 나중에 사용자에게 제품의 유형과 연관지어 사용 경험에 대해 물어보기 적합한 특징으로 배열에 담아 반환하세요. 제품의 유형은 'category' 라는 변수에 담아서 반환하세요.
        반환되는 배열의 변수명은 'features'이어야 하며, 다른 설명 없이 변수 'category'와 'features' 배열만 반환하세요. 
        각 특징은 자연스럽게 작성된 한글 단어이어야 하고, 기술 이름이나 브랜드 이름이 들어가서는 안됩니다.

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
						"너는 제품 설명을 바탕으로 제품군을 특정하고 주요 특징을 분석하여, 사용자가 주요 특징을 일상적이고 쉬운 표현으로 바꿔주는 AI이다.",
				},
				{ role: "user", content: prompt },
			],
		});

		const responseContent = completion.choices[0].message.content.trim();
		result = responseContent
			.replace(/\`\`\`python\n/, "")
			.replace(/\`\`\`/, "")
			.trim();

		let lines = result.trim().split("\n");

		// 첫 번째 줄에서 category 값 추출
		let category = lines[0].split("=")[1].trim().replace(/^"|"$/g, '').replace(/'/g, ''); 

		// features 배열 값 추출
		let features = lines
			.slice(1)
			.join("\n")
			.match(/\[(.*?)\]/s)[1] // 대괄호 안의 내용 추출
			.split(",") // 각 항목으로 나누기
			.map((feature) => feature.trim().replace(/'|"/g, "")); // 공백 및 따옴표 제거

		// JSON 응답 반환
		res.json({ category, features });
	} catch (error) {
		console.error("OpenAI API 호출 오류:", error);
		res.status(500).json({
			error: "Failed to generate review questions",
		});
	}
};

// OpenAI 리뷰 응답으로 평점과 답변 생성
const createReviewAnswers = async (req, res) => {};

module.exports = { createFeatures };
