const express = require('express');
const { createFeatures,createQuestions } = require('../controllers/openaiController');

const router = express.Router();

router.post('/features', createFeatures); // POST /api/openai/fatures
router.post('/questions', createQuestions); // POST /api/openai/questions

module.exports = router;