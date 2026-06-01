const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // Don't return password by default in queries
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values only once
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['guest', 'student', 'teacher', 'staff', 'admin'],
      default: 'guest',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpiry: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password before saving
userSchema.pre('save', async function () {
  // Only hash if password is modified or new
  if (!this.isModified('password')) {
    return;
  }

  // Hash password with salt rounds = 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Index for role field (email and googleId already have unique indexes)
userSchema.index({ role: 1 });

const knowledgeSyncService = require('../services/knowledgeSyncService');

userSchema.post('save', function (doc) {
  knowledgeSyncService.syncTeacher(doc);
});

userSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    knowledgeSyncService.syncTeacher(doc);
  }
});

userSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    knowledgeSyncService.removeTeacher(doc._id);
  }
});

module.exports = mongoose.model('User', userSchema);
