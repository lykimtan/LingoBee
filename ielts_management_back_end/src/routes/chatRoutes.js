const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/chatController');

// Route xử lý chat với AI chatbot
router.post('/', chatWithAI);

module.exports = router;
