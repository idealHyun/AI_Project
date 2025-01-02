const express = require('express');
const {
  getProductReview,
  createProductReview,
} = require('../controllers/reviewsController');

const router = express.Router();

router.get('/:id', getProductReview); // GET /api/reviews/:id
router.post('/:id', createProductReview); // POST /api/reviews/:id

module.exports = router;
