const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getUploadSignature, deleteUpload } = require('../controllers/uploadController');

const router = express.Router();

// POST /api/uploads/signature
router.post('/signature', authMiddleware, getUploadSignature);

// DELETE /api/uploads?url=...&resourceType=video
router.delete('/', authMiddleware, deleteUpload);

module.exports = router;
