const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getUploadSignature } = require('../controllers/uploadController');

const router = express.Router();

// POST /api/uploads/signature
router.post('/signature', authMiddleware, getUploadSignature);

module.exports = router;
