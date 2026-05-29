const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true, // Public description visible to all
    },
    courseDetail: {
      type: String,
      default: null, // Detailed description for paid students only
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: ['speaking', 'listening', 'reading', 'writing', 'full-test', 'grammar', 'vocabulary'],
    },
    level: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teachingAssistants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    totalVideos: {
      type: Number,
      default: 0,
    },
    totalExercises: {
      type: Number,
      default: 0,
    },
    totalMockTests: {
      type: Number,
      default: 0,
    },
    priceTiers: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        description: {
          type: String,
          default: '',
        },
        features: [String],
      },
    ],
    courseStartDate: {
      type: Date,
      default: null,
    },
    courseEndDate: {
      type: Date,
      default: null,
    },
    publicInfo: {
      thumbnail: {
        type: String,
        default: null,
      },
      shortDescription: {
        type: String,
        default: '',
      },
      targetLevel: {
        type: String,
        default: '',
      },
      courseOverview: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'invited', 'accepted', 'review', 'published', 'archived'],
      default: 'draft',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    durationInHours: {
      type: Number,
      default: 0,
    },
    estimatedWeeks: {
      type: Number,
      default: 0,
    },
    promoVideoUrl: {
      type: String,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
courseSchema.index({ teacher: 1 });
courseSchema.index({ teachingAssistants: 1 });
courseSchema.index({ category: 1, level: 1 });

courseSchema.pre('validate', function () {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
    });
  }
});

module.exports = mongoose.model('Course', courseSchema);
