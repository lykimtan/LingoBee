const express = require('express');
const router = express.Router();
const visualVocabController = require('../controllers/visualVocabController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { upload } = require('../config/multerConfig');

router.use(authMiddleware);

// POST /api/learning/visual-vocab/analyze
router.post('/analyze', upload.single('image'), visualVocabController.analyzeImage);

// POST /api/learning/visual-vocab/save
router.post('/save', visualVocabController.saveVisualVocab);

// GET /api/visual-vocab/history
router.get('/history', visualVocabController.getHistory);

// DELETE /api/visual-vocab/:id
router.delete('/:id', visualVocabController.deleteVisualVocab);

// DELETE /api/visual-vocab/:id/vocabularies/:word
router.delete('/:id/vocabularies/:word', visualVocabController.deleteVocabularyItem);

module.exports = router;
