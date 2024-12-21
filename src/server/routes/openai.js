const express = require('express');
const {
  createFeatures,
  createQuestions,
  createReviewAnswers,
} = require('../controllers/openaiController');
const validateApiKey = require('../utils/checkApiKey');

const router = express.Router();

// openai 사용하는 api는 API KEY 검증 추가

router.post('/features', validateApiKey, createFeatures); // POST /api/openai/features
router.post('/questions', validateApiKey, createQuestions); // POST /api/openai/questions
router.post('/answer', validateApiKey, createReviewAnswers); // POST /api/openai/answer

module.exports = router;
