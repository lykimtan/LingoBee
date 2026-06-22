const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
  {
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FlashcardDeck',
      required: true,
    },
    frontText: {
      type: String,
      required: true,
      trim: true,
    },
    partOfSpeech: {
      type: String,
      trim: true,
      default: '', // VD: 'noun', 'verb', 'adj', 'adv'
    },
    backText: {
      type: String,
      required: true,
      trim: true,
    },
    exampleSentence: {
      type: String,
      trim: true,
      default: '',
    },
    synonyms: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    audioUrl: {
      type: String,
      default: '',
    },
    phonetic: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

// Indexes
flashcardSchema.index({ deckId: 1, order: 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
