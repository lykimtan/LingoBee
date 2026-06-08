const sdk = require("microsoft-cognitiveservices-speech-sdk");
const config = new sdk.PronunciationAssessmentConfig("",
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme, // Changed to Phoneme
    true
);
console.log(config);
