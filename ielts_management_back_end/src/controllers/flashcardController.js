const { FlashcardDeck, Flashcard, FlashcardReview } = require('../models');
const logger = require('../utils/logger');

// --- DECK MANAGEMENT ---

exports.createDeck = async (req, res) => {
  try {
    const { title, description, thumbnailUrl, courseId, videoId, isPublic, tags } = req.body;
    const creatorId = req.user.id;

    const deck = new FlashcardDeck({
      title,
      description,
      thumbnailUrl,
      courseId,
      videoId,
      creatorId,
      isPublic: isPublic !== undefined ? isPublic : false,
      tags: tags || []
    });

    await deck.save();

    res.status(201).json({
      success: true,
      data: deck
    });
  } catch (error) {
    logger.error(`createDeck error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo bộ thẻ' });
  }
};

exports.getDecks = async (req, res) => {
  try {
    const { courseId, videoId, isPublic } = req.query;
    const query = {};

    if (courseId) query.courseId = courseId;
    if (videoId) query.videoId = videoId;

    // Nếu truyền isPublic=true thì lấy các bộ thẻ public, ngược lại mặc định lấy của mình
    if (isPublic === 'true') {
      query.isPublic = true;
    } else {
      query.creatorId = req.user.id;
    }

    const rawDecks = await FlashcardDeck.find(query).sort({ createdAt: -1 }).lean();

    const decks = await Promise.all(
      rawDecks.map(async (deck) => {
        const cardsCount = await Flashcard.countDocuments({ deckId: deck._id });
        const learnedCount = await FlashcardReview.countDocuments({ 
          deckId: deck._id, 
          studentId: req.user.id,
          status: { $ne: 'new' } 
        });

        return {
          ...deck,
          cardsCount,
          learnedCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: decks
    });
  } catch (error) {
    logger.error(`getDecks error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách bộ thẻ' });
  }
};

exports.getDeckById = async (req, res) => {
  try {
    const { deckId } = req.params;
    const deck = await FlashcardDeck.findById(deckId).lean();
    
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bộ thẻ' });
    }

    // Tính toán thêm cardsCount
    const cardsCount = await Flashcard.countDocuments({ deckId: deck._id });
    const learnedCount = await FlashcardReview.countDocuments({ 
      deckId: deck._id, 
      studentId: req.user.id,
      status: { $ne: 'new' } 
    });

    res.status(200).json({
      success: true,
      data: {
        ...deck,
        cardsCount,
        learnedCount
      }
    });
  } catch (error) {
    logger.error(`getDeckById error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy chi tiết bộ thẻ' });
  }
};

exports.createCard = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { frontText, backText, partOfSpeech, exampleSentence, imageUrl, audioUrl, phonetic } = req.body;

    const deck = await FlashcardDeck.findById(deckId);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bộ thẻ' });
    }

    // Only creator can add cards
    if (deck.creatorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thêm thẻ vào bộ này' });
    }

    const card = new Flashcard({
      deckId,
      frontText,
      backText,
      partOfSpeech,
      exampleSentence,
      imageUrl,
      audioUrl,
      phonetic
    });

    await card.save();

    res.status(201).json({
      success: true,
      data: card
    });
  } catch (error) {
    logger.error(`createCard error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo thẻ' });
  }
};

exports.getCardsInDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const cards = await Flashcard.find({ deckId }).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      data: cards
    });
  } catch (error) {
    logger.error(`getCardsInDeck error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách thẻ' });
  }
};

// --- SRS (SPACED REPETITION) LOGIC ---

exports.getDueCards = async (req, res) => {
  try {
    const { deckId } = req.params;
    const studentId = req.user.id;
    const today = new Date();

    // 1. Get all cards in the deck
    const allCards = await Flashcard.find({ deckId });
    if (allCards.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const cardIds = allCards.map(c => c._id);

    // 2. Get existing reviews for this student and these cards
    const reviews = await FlashcardReview.find({
      studentId,
      flashcardId: { $in: cardIds }
    });

    const reviewedCardIds = reviews.map(r => r.flashcardId.toString());

    // 3. Find 'new' cards (cards without a review yet)
    const newCards = allCards.filter(c => !reviewedCardIds.includes(c._id.toString()));

    // 4. Find 'due' cards (cards with nextReviewDate <= today)
    const dueReviewIds = reviews
      .filter(r => r.nextReviewDate && r.nextReviewDate <= today)
      .map(r => r.flashcardId.toString());

    const dueCards = allCards.filter(c => dueReviewIds.includes(c._id.toString()));

    // Trộn chung thẻ mới và thẻ cần ôn
    const cardsToStudy = [...newCards, ...dueCards];

    res.status(200).json({
      success: true,
      data: cardsToStudy,
      stats: {
        new: newCards.length,
        due: dueCards.length,
        total: allCards.length
      }
    });
  } catch (error) {
    logger.error(`getDueCards error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thẻ cần học' });
  }
};

exports.submitReview = async (req, res) => {
  try {
    const { flashcardId } = req.params;
    const { quality } = req.body; // quality: 0 (Quên hoàn toàn), 1 (Nhớ mang máng), 2 (Nhớ rõ)
    const studentId = req.user.id;

    if (![0, 1, 2].includes(quality)) {
      return res.status(400).json({ success: false, message: 'Quality không hợp lệ (0, 1, 2)' });
    }

    const flashcard = await Flashcard.findById(flashcardId);
    if (!flashcard) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ' });
    }

    let review = await FlashcardReview.findOne({ studentId, flashcardId });

    if (!review) {
      review = new FlashcardReview({
        studentId,
        flashcardId,
        deckId: flashcard.deckId,
        status: 'learning',
        repetition: 0,
        interval: 0,
        easeFactor: 2.5
      });
    }

    // Thuật toán SM-2 rút gọn
    if (quality === 0) { // Quên hoàn toàn
      review.repetition = 0;
      review.interval = 1;
      review.easeFactor = Math.max(1.3, review.easeFactor - 0.2);
    } else if (quality === 1) { // Nhớ mang máng (Hard)
      // Fix lỗi số thập phân bằng Math.round
      review.interval = review.interval === 0 ? 1 : Math.round(review.interval * 1.2);
      // easeFactor giữ nguyên hoặc giảm cực nhẹ (tùy bạn chọn)
    } else { // Nhớ rõ (Easy/Good)
      review.repetition += 1;
      if (review.repetition === 1) {
        review.interval = 1;
      } else if (review.repetition === 2) {
        review.interval = 6;
      } else {
        // Luôn đảm bảo interval là số nguyên
        review.interval = Math.round(review.interval * review.easeFactor);
      }
      // Tăng độ dễ nhưng nên có mức trần (VD: Max là 3.0) để khoảng cách không bị giãn ra quá vô lý
      review.easeFactor = Math.min(3.0, review.easeFactor + 0.1);
    }

    // Fix lỗi "Cộng đúng 24h": Reset thời gian về 00:00:00 (Start of Day)
    const nextDate = new Date();
    nextDate.setHours(0, 0, 0, 0); // Đưa về 0h sáng của ngày hôm nay
    nextDate.setDate(nextDate.getDate() + review.interval); // Cộng số ngày lên

    review.nextReviewDate = nextDate;
    review.lastReviewedAt = new Date(); // Vẫn giữ thời gian thực tế để track Heatmap/Streak

    if (review.interval > 21) {
      review.status = 'graduated';
    } else {
      review.status = 'reviewing';
    }

    await review.save();

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    logger.error(`submitReview error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi nộp kết quả review' });
  }
};

exports.updateDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const updates = req.body;
    
    // Đảm bảo chỉ người tạo mới được update
    const deck = await FlashcardDeck.findOneAndUpdate(
      { _id: deckId, creatorId: req.user.id },
      { $set: updates },
      { new: true }
    );

    if (!deck) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bộ thẻ hoặc bạn không có quyền sửa' });
    }

    res.status(200).json({ success: true, data: deck });
  } catch (error) {
    logger.error(`updateDeck error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật bộ thẻ' });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const updates = req.body;

    // TODO: Nên kiểm tra xem user có phải chủ sở hữu deck chứa card này không
    const card = await Flashcard.findByIdAndUpdate(cardId, { $set: updates }, { new: true });

    if (!card) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ' });
    }

    res.status(200).json({ success: true, data: card });
  } catch (error) {
    logger.error(`updateCard error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật thẻ' });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const card = await Flashcard.findByIdAndDelete(cardId);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ' });
    }

    // Xóa luôn các review liên quan đến thẻ này
    await FlashcardReview.deleteMany({ flashcardId: cardId });

    res.status(200).json({ success: true, message: 'Đã xóa thẻ' });
  } catch (error) {
    logger.error(`deleteCard error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa thẻ' });
  }
};
