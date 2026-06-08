const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    targetType: {
        type: String,
        enum: ['Video', 'Course', 'User'],
        required: [true, 'Target type is required']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Target ID is required'],
        refPath: 'targetType'
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        validate: {
            validator: function (value) {
                // 1. Thảo luận dưới Video thì không được có đánh giá sao
                if (this.targetType === 'Video' && value != null) {
                    return false;
                }
                // 2. Bình luận phản hồi (Reply) thì không được có đánh giá sao
                if (this.parentId != null && value != null) {
                    return false;
                }
                return true;
            },
            message: 'Rating is only applicable for root comments on Courses or Teachers.'
        }
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likeCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'hidden', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field để kiểm tra nhanh xem đây có phải là reply không
commentSchema.virtual('isReply').get(function () {
    return this.parentId != null;
});

// Virtual populate để lấy danh sách các replies lồng nhau
commentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentId'
});

commentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);