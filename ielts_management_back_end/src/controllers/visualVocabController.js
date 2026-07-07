const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const cloudinary = require('../config/cloudinary');
const { generateObject } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const { z } = require('zod');
const VisualVocab = require('../models/VisualVocab');
const logger = require('../utils/logger');

const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng upload một hình ảnh.' });
    }

    const filePath = req.file.path;

    // 1. Gửi ảnh gốc sang FastAPI để nhận diện bằng YOLOv10 và lấy ảnh đã khoanh vùng
    let detectedObjects = [];
    let processedImageBase64 = '';

    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));

      const fastApiResponse = await axios.post('http://localhost:8000/api/analyze-image', form, {
        headers: {
          ...form.getHeaders()
        }
      });

      if (fastApiResponse.data && fastApiResponse.data.success) {
        detectedObjects = fastApiResponse.data.detected_objects || [];
        processedImageBase64 = fastApiResponse.data.processed_image_base64;
      }
    } catch (fastApiError) {
      logger.error('Error calling FastAPI:', fastApiError.message);
      fs.unlink(filePath, () => { });
      return res.status(500).json({ success: false, message: 'Lỗi khi gọi AI phân tích ảnh.' });
    }

    // Xóa file local sau khi gửi xong
    fs.unlink(filePath, (err) => {
      if (err) logger.warn('Failed to delete temp file:', err);
    });

    if (detectedObjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'AI không nhận diện được vật thể nào rõ ràng trong bức ảnh này. Vui lòng thử ảnh khác.'
      });
    }

    // 2. Upload ảnh đã khoanh vùng (base64) lên Cloudinary
    let cloudinaryUrl = '';
    try {
      const uploadResult = await cloudinary.uploader.upload(processedImageBase64, {
        folder: 'visual_vocab'
      });
      cloudinaryUrl = uploadResult.secure_url;
    } catch (uploadError) {
      logger.error('Error uploading to Cloudinary:', uploadError);
      return res.status(500).json({ success: false, message: 'Lỗi khi lưu ảnh đã khoanh vùng lên Cloud.' });
    }

    // 3. Dùng Gemini để tạo Flashcard Vocabulary Data
    try {
      const { object } = await generateObject({
        model: googleProvider('gemini-flash-lite-latest'),
        schema: z.object({
          vocabularies: z.array(z.object({
            detectedWord: z.string().describe('Từ gốc chính xác từ YOLO (vd: "cell phone", "tie", "person").'),
            word: z.string().describe('BẮT BUỘC giữ nguyên CHÍNH XÁC từ gốc trong detectedWord (không được thay bằng từ khác hay từ đồng nghĩa). Chỉ được viết hoa chữ cái đầu cho chuẩn (vd: "Cell Phone", "Tie", "Person").'),
            translation: z.string().describe('Nghĩa tiếng Việt ngắn gọn, dễ hiểu.'),
            partOfSpeech: z.string().describe('Từ loại (vd: noun, verb, adj).'),
            phonetic: z.string().describe('Phiên âm quốc tế IPA (vd: /wɜːd/).'),
            example: z.string().describe('Một câu ví dụ thực tế sử dụng từ này bằng tiếng Anh.'),
            synonyms: z.array(z.string()).describe('Ít nhất 3 từ đồng nghĩa hoặc từ học thuật cấp độ cao (IELTS 7.0+)')
          }))
        }),
        prompt: `Tôi vừa dùng AI (YOLO) nhận diện được danh sách các vật thể/từ vựng sau từ một bức ảnh: ${JSON.stringify(detectedObjects)}.
                YÊU CẦU BẮT BUỘC:
                1. Bạn phải tạo danh sách từ vựng tương ứng 1-1 với danh sách trên và giữ ĐÚNG THỨ TỰ.
                2. Với mỗi phần tử, trường "detectedWord" phải là từ gốc từ YOLO.
                3. Trường "word" BẮT BUỘC PHẢI LÀ TỪ GỐC ĐÓ. TUYỆT ĐỐI KHÔNG ĐƯỢC thay thế từ gốc bằng từ đồng nghĩa hay từ khác (ví dụ: cấm đổi "cell phone" thành "Mobile phone", cấm đổi "tie" thành "Necktie").
                4. Vì đây là ứng dụng học IELTS, hãy đưa các từ từ đồng nghĩa cao cấp (như Mobile phone, Handheld device, Necktie, Cravat...) vào trường "synonyms" (ít nhất 3 từ đồng nghĩa cấp độ IELTS 7.0+) để học viên mở rộng vốn từ.`
      });

      // Post-process to guarantee 100% that the exact detected word from YOLO is preserved as the main word
      const finalVocabularies = object.vocabularies.map((vocab, idx) => {
        // Match with detectedWord or fallback to index
        const matchedDetected = detectedObjects.find(
          d => d.toLowerCase() === vocab.detectedWord?.toLowerCase() ||
            d.toLowerCase() === vocab.word?.toLowerCase()
        ) || detectedObjects[idx];

        if (matchedDetected) {
          // Format as Title Case (e.g. "cell phone" -> "Cell Phone", "tie" -> "Tie")
          const formattedWord = matchedDetected.replace(/\b\w/g, l => l.toUpperCase());
          return {
            ...vocab,
            word: formattedWord
          };
        }
        return vocab;
      });

      // 4. Trả về kết quả cho Front-end (không lưu vào DB)
      return res.status(200).json({
        success: true,
        data: {
          imageUrl: cloudinaryUrl,
          vocabularies: finalVocabularies
        }
      });

    } catch (geminiError) {
      logger.error('Error calling Gemini:', geminiError);
      return res.status(500).json({ success: false, message: 'Lỗi khi tạo từ vựng với LLM.' });
    }

  } catch (error) {
    logger.error('Analyze Image Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const saveVisualVocab = async (req, res) => {
  try {
    const { imageUrl, vocabularies } = req.body;

    if (!imageUrl || !vocabularies || !Array.isArray(vocabularies)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ.' });
    }

    const newVisualVocab = new VisualVocab({
      userId: req.user.id,
      imageUrl,
      vocabularies
    });

    await newVisualVocab.save();

    return res.status(200).json({
      success: true,
      data: newVisualVocab
    });
  } catch (error) {
    logger.error('Save Visual Vocab Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const history = await VisualVocab.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await VisualVocab.countDocuments({ userId: req.user.id });

    return res.status(200).json({
      success: true,
      data: history,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get Visual Vocab History Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const deleteVisualVocab = async (req, res) => {
  try {
    const { id } = req.params;
    const visualVocab = await VisualVocab.findOne({ _id: id, userId: req.user.id });

    if (!visualVocab) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi hoặc không có quyền.' });
    }

    // Xóa ảnh trên Cloudinary
    if (visualVocab.imageUrl) {
      try {
        const urlParts = visualVocab.imageUrl.split('/');
        const fileName = urlParts.pop().split('.')[0];
        const folder = urlParts.pop();
        const publicId = `${folder}/${fileName}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        logger.warn(`Failed to delete Cloudinary image`, cloudErr);
      }
    }

    await VisualVocab.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Đã xóa bản ghi thành công.' });
  } catch (error) {
    logger.error('Delete Visual Vocab Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const deleteVocabularyItem = async (req, res) => {
  try {
    const { id, word } = req.params;

    const visualVocab = await VisualVocab.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $pull: { vocabularies: { word: word } } },
      { new: true }
    );

    if (!visualVocab) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi hoặc không có quyền.' });
    }

    return res.status(200).json({ success: true, data: visualVocab });
  } catch (error) {
    logger.error('Delete Vocabulary Item Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = {
  analyzeImage,
  getHistory,
  saveVisualVocab,
  deleteVisualVocab,
  deleteVocabularyItem
};
