// Flashcard Routes
const router = require('express').Router();
const flashcardController = require('../controllers/flashcardController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Apply auth middleware to all flashcard routes
router.use(authMiddleware);

// --- DECK ROUTES ---
router.route('/decks')
  .post(flashcardController.createDeck)
  .get(flashcardController.getDecks);

router.route('/decks/:deckId')
  .get(flashcardController.getDeckById)
  .put(flashcardController.updateDeck)
  .delete(flashcardController.deleteDeck);

// --- FLASHCARD ROUTES ---
router.route('/decks/:deckId/cards')
  .post(flashcardController.createCard)
  .get(flashcardController.getCardsInDeck);

router.route('/cards/:cardId')
  .put(flashcardController.updateCard)
  .delete(flashcardController.deleteCard);

// --- SRS / STUDY ROUTES ---
router.get('/decks/:deckId/study', flashcardController.getDueCards);
router.post('/cards/:flashcardId/review', flashcardController.submitReview);

module.exports = router;
