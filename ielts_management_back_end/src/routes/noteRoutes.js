const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getNotesByVideo,
  createNote,
  updateNote,
  deleteNote
} = require('../controllers/noteController');

const router = express.Router();

router.use(authMiddleware);

// Route: GET /api/notes/video/:videoId
router.get('/video/:videoId', getNotesByVideo);

// Route: POST /api/notes
router.post('/', createNote);

// Route: PUT /api/notes/:id
router.put('/:id', updateNote);

// Route: DELETE /api/notes/:id
router.delete('/:id', deleteNote);

module.exports = router;
