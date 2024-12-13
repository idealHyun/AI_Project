const express = require("express");
const {
  createFeatures,
  createQuestions,
  createReviewAnswers,
} = require("../controllers/openaiController");
const validateApiKey = require("../utils/validateApiKey");

const router = express.Router();

router.post("/features", validateApiKey, createFeatures); // POST /api/openai/fatures
router.post("/questions", validateApiKey, createQuestions); // POST /api/openai/questions
router.post("/answer", validateApiKey, createReviewAnswers); // POST /api/openai/answer

module.exports = router;
