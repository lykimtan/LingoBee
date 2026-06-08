const sdk = require("microsoft-cognitiveservices-speech-sdk");
const config = new sdk.PronunciationAssessmentConfig("",
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Word,
    true
);
config.enableProsodyAssessment = true;
console.log(config);
