const express = require('express');
const {
  createFeatures,
  createQuestions,
  createReviewAnswers,
} = require('../controllers/openaiController');

const router = express.Router();

router.post('/features', createFeatures); // POST /api/openai/fatures
router.post('/questions', createQuestions); // POST /api/openai/questions
router.post('/answer', createReviewAnswers); // POST /api/openai/answer

module.exports = router;
