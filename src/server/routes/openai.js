const express = require('express');
const { createFeatures } = require('../controllers/openaiController');

const router = express.Router();

router.post('/features', createFeatures); // POST /api/openai/fatures

module.exports = router;