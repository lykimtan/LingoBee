const sdk = require("microsoft-cognitiveservices-speech-sdk");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

const formatCloudinaryUrlForAzure = (url) => {
  if (!url) return null;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const parts = url.split("/upload/");
    if (parts.length === 2) {
      const transformedTail = parts[1].replace(/\.[a-zA-Z0-9]+$/, '.wav');
      return `${parts[0]}/upload/f_wav,ar_16000/${transformedTail}`;
    }
  }
  return url;
};

const downloadAudioToTempFile = async (audioUrl) => {
  const tempFilePath = path.join(os.tmpdir(), `audio-${uuidv4()}.wav`);
  const writer = fs.createWriteStream(tempFilePath);
  const response = await axios({
    url: audioUrl,
    method: "GET",
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    let error = null;
    writer.on("error", (err) => {
      error = err;
      writer.close();
      reject(err);
    });
    writer.on("close", () => {
      if (!error) resolve(tempFilePath);
    });
  });
};

const assessPronunciation = async (audioUrl) => {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    throw new Error("Azure Speech configuration is missing (Key or Region).");
  }

  const processedUrl = formatCloudinaryUrlForAzure(audioUrl);
  if (!processedUrl) throw new Error("Invalid audio URL");

  const tempFilePath = await downloadAudioToTempFile(processedUrl);

  // Khai báo các biến SDK ở ngoài để block finally có thể gọi .close()
  let speechConfig, audioConfig, recognizer;

  try {
    speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechRecognitionLanguage = "en-US";

    // Khởi tạo AudioConfig từ file
    audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(tempFilePath));

    const pronConfig = new sdk.PronunciationAssessmentConfig(
      "",
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true
    );
    pronConfig.enableProsodyAssessment = true;
    pronConfig.phonemeAlphabet = "IPA";

    recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    pronConfig.applyTo(recognizer);

    // THÊM AWAIT VÀO ĐÂY để chờ recognition hoàn tất
    const result = await new Promise((resolve, reject) => {
      const words = [];
      const utteranceResults = [];

      recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          const pronResult = sdk.PronunciationAssessmentResult.fromResult(e.result);
          if (pronResult) {
            utteranceResults.push({
              text: e.result.text,
              accuracyScore: pronResult.accuracyScore,
              fluencyScore: pronResult.fluencyScore,
              completenessScore: pronResult.completenessScore,
              prosodyScore: pronResult.prosodyScore,
              pronunciationScore: pronResult.pronunciationScore,
              duration: e.result.duration,
            });

            if (pronResult.detailResult && pronResult.detailResult.Words) {
              pronResult.detailResult.Words.forEach((word) => {
                const phonemes = word.Phonemes ? word.Phonemes.map(p => ({
                  phoneme: p.Phoneme,
                  accuracyScore: p.PronunciationAssessment?.AccuracyScore || 0
                })) : [];

                const syllables = word.Syllables ? word.Syllables.map(s => ({
                  syllable: s.Syllable,
                  accuracyScore: s.PronunciationAssessment?.AccuracyScore || 0
                })) : [];

                words.push({
                  word: word.Word,
                  accuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
                  errorType: word.PronunciationAssessment?.ErrorType || 'None',
                  phonemes,
                  syllables
                });
              });
            }
          }
        }
      };

      recognizer.canceled = (s, e) => {
        if (e.reason === sdk.CancellationReason.Error) {
          logger.error(`Azure Speech API Error: ${e.errorDetails}`);
          // Phải pass callback vào stopContinuousRecognitionAsync
          recognizer.stopContinuousRecognitionAsync(
            () => reject(new Error(`Azure Speech API Error: ${e.errorDetails}`)),
            (err) => reject(new Error(`Lỗi khi stop recognizer: ${err}`))
          );
        }
      };

      recognizer.sessionStopped = (s, e) => {
        recognizer.stopContinuousRecognitionAsync(
          () => {
            if (utteranceResults.length === 0) {
              return resolve({
                pronunciationScore: 0, accuracyScore: 0, fluencyScore: 0, completenessScore: 0, prosodyScore: 0, words: [],
              });
            }

            let totalDuration = 0, sumPronunciation = 0, sumAccuracy = 0, sumFluency = 0, sumCompleteness = 0, sumProsody = 0;

            utteranceResults.forEach((r) => {
              const dur = Number(r.duration) || 1;
              totalDuration += dur;
              sumPronunciation += (Number(r.pronunciationScore) || 0) * dur;
              sumAccuracy += (Number(r.accuracyScore) || 0) * dur;
              sumFluency += (Number(r.fluencyScore) || 0) * dur;
              sumCompleteness += (Number(r.completenessScore) || 0) * dur;
              sumProsody += (Number(r.prosodyScore) || 0) * dur;
            });

            const finalResult = {
              pronunciationScore: totalDuration > 0 ? (sumPronunciation / totalDuration) || 0 : 0,
              accuracyScore: totalDuration > 0 ? (sumAccuracy / totalDuration) || 0 : 0,
              fluencyScore: totalDuration > 0 ? (sumFluency / totalDuration) || 0 : 0,
              completenessScore: totalDuration > 0 ? (sumCompleteness / totalDuration) || 0 : 0,
              prosodyScore: totalDuration > 0 ? (sumProsody / totalDuration) || 0 : 0,
              words: words,
            };

            resolve(finalResult);
          },
          (err) => reject(err)
        );
      };

      recognizer.startContinuousRecognitionAsync();
    });

    return result;

  } finally {
    // 1. Dọn dẹp tài nguyên C++ để tránh memory leak
    if (recognizer) recognizer.close();
    if (audioConfig) audioConfig.close();
    if (speechConfig) speechConfig.close();

    // 2. Xóa file tạm
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        logger.error(`Failed to delete temp file: ${err.message}`);
      }
    }
  }
};

module.exports = {
  assessPronunciation,
};