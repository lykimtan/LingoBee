const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Tra cứu thông tin từ vựng từ Free Dictionary API (dictionaryapi.dev)
 * @param {string} word - Từ hoặc cụm từ cần tra cứu
 * @returns {Promise<Object|null>} - Dữ liệu từ vựng đã được format, hoặc null nếu không tìm thấy
 */
const lookupWord = async (word) => {
  if (!word || !word.trim()) {
    return null;
  }

  const cleanWord = word.trim();

  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord.toLowerCase())}`,
      { timeout: 5000 }
    );

    if (response.data && response.data.length > 0) {
      const entry = response.data[0];

      // Extract phonetic
      let fetchedPhonetic = entry.phonetic || '';
      let fetchedAudio = '';

      if (entry.phonetics && entry.phonetics.length > 0) {
        const phoneticObj = entry.phonetics.find((p) => p.text && p.audio);
        if (phoneticObj) {
          if (!fetchedPhonetic) fetchedPhonetic = phoneticObj.text;
          fetchedAudio = phoneticObj.audio;
        } else {
          const anyAudio = entry.phonetics.find((p) => p.audio);
          if (anyAudio) fetchedAudio = anyAudio.audio;
        }
      }

      // Extract meanings
      const meanings = [];
      if (entry.meanings && entry.meanings.length > 0) {
        for (const m of entry.meanings) {
          const partOfSpeech = m.partOfSpeech || '';
          if (m.definitions && m.definitions.length > 0) {
            for (const d of m.definitions) {
              meanings.push({
                partOfSpeech,
                definition: d.definition || '',
                example: d.example || '',
                synonyms:
                  d.synonyms && d.synonyms.length > 0
                    ? d.synonyms
                    : m.synonyms || [],
              });
            }
          }
        }
      }

      if (meanings.length > 0) {
        logger.info(`[Dictionary Service] Found "${cleanWord}" in Free Dictionary API`);
        return {
          phonetic: fetchedPhonetic,
          audioUrl: fetchedAudio,
          meanings: meanings.slice(0, 10), // Giới hạn tối đa 10 nghĩa
          source: 'dictionary_api',
        };
      }
    }
    return null;
  } catch (error) {
    logger.warn(`[Dictionary Service] Lookup failed or 404 for "${cleanWord}": ${error.message}`);
    return null;
  }
};

module.exports = {
  lookupWord,
};
