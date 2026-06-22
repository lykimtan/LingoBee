const mongoose = require('mongoose');

const vocabItemSchema = new mongoose.Schema(
  {
    word: { type: String, required: true },
    translation: { type: String, required: true },
    partOfSpeech: { type: String, default: '' },
    phonetic: { type: String, default: '' },
    example: { type: String, default: '' },
    synonyms: { type: [String], default: [] }
  },
  { _id: false }
);

const visualVocabSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    vocabularies: {
      type: [vocabItemSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('VisualVocab', visualVocabSchema);
