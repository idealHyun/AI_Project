const OpenAI = require("openai");

const openai = new OpenAI({
	apiKey: process.env.OPEN_API_KEY,
});

// OpenAI 리뷰 생성 API
const createReviewQuestions = async (req, res) => {
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

		const match = responseContent.match(/questions\s*=\s*(\[[\s\S]*?\])/);

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
};

// OpenAI 리뷰 응답으로 평점과 답변 생성
const createReviewAnswers = async (req,res) =>{
	
}

module.exports = { createReviewQuestions };
