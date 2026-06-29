const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/chatController');
const { authMiddlewareOptional } = require('../middleware/authMiddleware');

// Route xử lý chat với AI chatbot
router.post('/', authMiddlewareOptional, chatWithAI);

module.exports = router;
