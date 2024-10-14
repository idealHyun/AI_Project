const express = require('express');
const { createReviewQuestions } = require('../controllers/openaiController');

const router = express.Router();

router.post('/review', createReviewQuestions); // POST /api/openai/

module.exports = router;