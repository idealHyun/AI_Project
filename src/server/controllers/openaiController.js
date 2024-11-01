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
						"너는 제품 설명을 바탕으로 제품군을 특정하고 주요 특징을 분석하여, 사용자가 주요 특징을 일상적이고 쉬운 표현으로 바꿔주는 AI이다. 답변은 무조건 마크다운 형식(```)은 없이 객체({})에 담아서 보내줘",
				},
				{ role: "user", content: prompt },
			],
		});

		const responseContent = completion.choices[0].message.content.trim();

		res.json(JSON.parse(responseContent));
	} catch (error) {
		console.error("OpenAI API 호출 오류:", error);
		res.status(500).json({
			error: "Failed to generate review questions",
		});
	}
};

// OpenAI 리뷰 응답으로 평점과 답변 생성
const createQuestions = async (req, res) => {
	const category = req.body.category;
	const features = req.body.features;
	const arrFeatures = features.split(",").map((feature) => feature.trim());

	const selectedFeatures =
		arrFeatures.length > 5
			? arrFeatures.sort(() => 0.5 - Math.random()).slice(0, 5)
			: arrFeatures;

	const prompt = `
        category 변수는 제품의 유형이고, features 는 제품의 특징들입니다. 그 특징들중 5개를 랜덤으로 선택하세요. 만약 특징이 5개가 안된다면 있는 만큼만 선택하세요. 선택한 특징들을 바탕으로 전문 용어를 피하고 일상적이고 쉬운 표현으로 작성된  
        질문 5개와 전체적인 만족도를 물어보는 질문 2개를 만들어, 배열에 담아 반환하세요 . 만약 특징이 5개가 안된다면 특징이 있는 만큼만 만들어주세요. 
        반환되는 배열의 변수명은 'questions'이어야 하며, 다른 설명 없이 오직 'questions' 배열만 반환하세요.
        각 질문은 자연스럽게 작성된 한글 질문이어야 하고, 기술 이름이나 브랜드 이름이 들어가서는 안됩니다.

        category:
        ${category}
		features:
		${selectedFeatures}
    `;

	try {
		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content:
						"너는 제품군과 주어진 제품들의 특징을 이용하여 일상적이고 쉬운 표현을 사용한 질문을 만들어, 사용자가 대답하기 쉬운 질문을 만들어주는 AI이다. 답변은 무조건 마크다운 형식(```)은 없이 객체({})에 담아서 보내줘",
				},
				{ role: "user", content: prompt },
			],
		});

		const responseContent = completion.choices[0].message.content.trim();

		console.log(responseContent)

		res.json(JSON.parse(responseContent));
	} catch (error) {
		console.error("OpenAI API 호출 오류:", error);
		res.status(500).json({
			error: "Failed to generate review questions",
		});
	}
};

// OpenAI 리뷰 응답으로 평점과 답변 생성
const createReviewAnswers = async (req, res) => {
	const category = req.body.category;
	const features = req.body.features;
	const arrFeatures = features.split(",").map((feature) => feature.trim());

	const selectedFeatures =
		arrFeatures.length > 5
			? arrFeatures.sort(() => 0.5 - Math.random()).slice(0, 5)
			: arrFeatures;

	const prompt = `
        category 변수는 제품의 유형이고, features 는 제품의 특징들입니다. 그 특징들중 5개를 랜덤으로 선택하세요. 만약 특징이 5개가 안된다면 있는 만큼만 선택하세요. 선택한 특징들을 바탕으로 전문 용어를 피하고 일상적이고 쉬운 표현으로 작성된  
        질문 5개와 전체적인 만족도를 물어보는 질문 2개를 만들어, 배열에 담아 반환하세요 . 만약 특징이 5개가 안된다면 특징이 있는 만큼만 만들어주세요. 
        반환되는 배열의 변수명은 'questions'이어야 하며, 다른 설명 없이 오직 'questions' 배열만 반환하세요.
        각 질문은 자연스럽게 작성된 한글 질문이어야 하고, 기술 이름이나 브랜드 이름이 들어가서는 안됩니다.

        category:
        ${category}
		features:
		${selectedFeatures}
    `;

	try {
		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content:
						"너는 입력받은 질문과 답변을 통해 하나의 리뷰를 만들어주는 AI야. 답변은 무조건 마크다운 형식(```)은 없이 객체({})에 담아서 보내줘",
				},
				{ role: "user", content: prompt },
			],
		});

		const responseContent = completion.choices[0].message.content.trim();

		res.json(JSON.parse(responseContent));
	} catch (error) {
		console.error("OpenAI API 호출 오류:", error);
		res.status(500).json({
			error: "Failed to generate review questions",
		});
	}
};

module.exports = { createFeatures, createQuestions, createReviewAnswers };
