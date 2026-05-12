// models/index.js - Central export for all models

const User = require('./User');
const Student = require('./Student');
const Course = require('./Course');
const Video = require('./Video');
const Exercise = require('./Exercise');
const MockTest = require('./MockTest');
const Submission = require('./Submission');
const LearningPath = require('./LearningPath');
const Message = require('./Message');
const Payment = require('./Payment');
const DiscountCode = require('./DiscountCode');
const VideoProgress = require('./VideoProgress');
const Notification = require('./Notification');
const CourseInvitation = require('./CourseInvitation');

module.exports = {
  User,
  Student,
  Course,
  Video,
  Exercise,
  MockTest,
  Submission,
  LearningPath,
  Message,
  Payment,
  DiscountCode,
  VideoProgress,
  Notification,
  CourseInvitation,
};
