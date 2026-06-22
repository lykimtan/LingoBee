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
            word: z.string().describe('Từ vựng tiếng Anh (từ gốc dạng nguyên thể).'),
            translation: z.string().describe('Nghĩa tiếng Việt ngắn gọn, dễ hiểu.'),
            partOfSpeech: z.string().describe('Từ loại (vd: noun, verb, adj).'),
            phonetic: z.string().describe('Phiên âm quốc tế IPA (vd: /wɜːd/).'),
            example: z.string().describe('Một câu ví dụ thực tế sử dụng từ này bằng tiếng Anh.'),
            synonyms: z.array(z.string()).describe('Ít nhất 3 từ đồng nghĩa cấp độ cao')
          }))
        }),
        prompt: `Tôi vừa dùng AI nhận diện được các vật thể sau trong một bức ảnh: ${detectedObjects.join(', ')}. Hãy tạo thông tin từ vựng chi tiết cho từng từ để giúp người học IELTS ôn tập. Đặc biệt, với mỗi từ vựng, hãy cung cấp ít nhất 3 từ đồng nghĩa (synonyms) ở cấp độ cao (IELTS 7.0 trở lên).`
      });

      // 4. Trả về kết quả cho Front-end (không lưu vào DB)
      return res.status(200).json({
        success: true,
        data: {
          imageUrl: cloudinaryUrl,
          vocabularies: object.vocabularies
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
