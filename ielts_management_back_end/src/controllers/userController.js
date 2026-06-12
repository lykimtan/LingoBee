const { User, Student } = require('../models');
const logger = require('../utils/logger');

// ============================================
// GET ALL USERS (ADMIN ONLY)
// ============================================
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await User.countDocuments(filter);

    // Get users
    const users = await User.find(filter)
      .select('-password -emailVerificationToken -passwordResetToken')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    logger.info(`Admin retrieved ${users.length} users`);

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error(`Error getting all users: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// GET USER BY ID
// ============================================
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user._id.toString();
    const requestingUserRole = req.user.role;

    // Check authorization (admin or self)
    if (requestingUserRole !== 'admin' && requestingUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this user',
      });
    }

    const user = await User.findById(userId).select(
      '-password -emailVerificationToken -passwordResetToken'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get student profile if user is student
    let student = null;
    if (user.role === 'student') {
      student = await Student.findOne({ userId })
        .populate('enrolledCourses.courseId', 'title description')
        .populate('enrolledCourses.learningPath', 'dailySchedule');
    }

    logger.info(`User retrieved: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user,
        student,
      },
    });
  } catch (error) {
    logger.error(`Error getting user: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// UPDATE USER (ADMIN OR SELF)
// ============================================
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user._id.toString();
    const requestingUserRole = req.user.role;
    const { name, avatar, role, status } = req.body;

    // Check authorization (admin or self)
    if (requestingUserRole !== 'admin' && requestingUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this user',
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    // Admin-only updates
    if (requestingUserRole === 'admin') {
      if (role && ['guest', 'student', 'teacher', 'staff', 'admin'].includes(role)) {
        user.role = role;
      }
      if (status && ['active', 'inactive', 'suspended'].includes(status)) {
        user.status = status;
      }
    }

    await user.save();

    logger.info(`User updated: ${user.email} by ${req.user.email}`);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// DELETE USER (ADMIN ONLY)
// ============================================
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Don't allow deleting other admins
    if (user.role === 'admin' && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete other admin accounts',
      });
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userId);

    // Delete student profile if exists
    if (user.role === 'student') {
      await Student.findOneAndDelete({ userId });
    }

    logger.info(`User deleted: ${user.email} by ${req.user.email}`);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUserId: deletedUser._id,
        email: deletedUser.email,
      },
    });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// BLOCK/SUSPEND USER (ADMIN ONLY)
// ============================================
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Don't allow blocking yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block yourself',
      });
    }

    user.status = 'suspended';
    await user.save();

    logger.info(
      `User suspended: ${user.email} by ${req.user.email}. Reason: ${reason || 'No reason provided'}`
    );

    return res.status(200).json({
      success: true,
      message: 'User suspended successfully',
      data: {
        userId: user._id,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    logger.error(`Error blocking user: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error suspending user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// UNBLOCK/ACTIVATE USER (ADMIN ONLY)
// ============================================
const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.status = 'active';
    await user.save();

    logger.info(`User activated: ${user.email} by ${req.user.email}`);

    return res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: {
        userId: user._id,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    logger.error(`Error unblocking user: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error activating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// GET USER STATISTICS (ADMIN ONLY)
// ============================================
const getUserStatistics = async (req, res) => {
  try {
    // Total users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Total users by status
    const usersByStatus = await User.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Total verified emails
    const verifiedEmails = await User.countDocuments({ isEmailVerified: true });

    // Total users created this month
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonthStart },
    });

    // Get total students with course enrollment stats
    const studentStats = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          avgCoursesEnrolled: { $avg: { $size: '$enrolledCourses' } },
          avgMockTestsTaken: { $avg: { $size: '$mockTestHistory' } },
        },
      },
    ]);

    logger.info('Admin retrieved user statistics');

    return res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        totalUsers: await User.countDocuments(),
        usersByRole,
        usersByStatus,
        verifiedEmails,
        newUsersThisMonth,
        studentStatistics: studentStats[0] || {},
      },
    });
  } catch (error) {
    logger.error(`Error getting user statistics: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// SEARCH USERS (ADMIN ONLY)
// ============================================
const searchUsers = async (req, res) => {
  try {
    const { query, role, status } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const filter = {
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
      ],
    };

    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter)
      .select('-password -emailVerificationToken -passwordResetToken')
      .limit(20)
      .sort({ name: 1 });

    logger.info(`Admin searched users with query: ${query}`);

    return res.status(200).json({
      success: true,
      message: 'Search results retrieved',
      data: {
        results: users,
        count: users.length,
      },
    });
  } catch (error) {
    logger.error(`Error searching users: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// SEARCH TEACHERS (TEACHER ONLY)
// ============================================
const searchTeachers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const filter = {
      role: 'teacher',
      status: 'active',
      _id: { $ne: req.user._id }, // Don't return the searcher themselves
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
      ],
    };

    const users = await User.find(filter)
      .select('name email avatar role')
      .limit(10)
      .sort({ name: 1 });

    logger.info(`Teacher searched for other teachers with query: ${query}`);

    return res.status(200).json({
      success: true,
      message: 'Search results retrieved',
      data: {
        results: users,
        count: users.length,
      },
    });
  } catch (error) {
    logger.error(`Error searching teachers: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error searching teachers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// GET USER PROFILE WITH RELATED DATA
// ============================================
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      '-password -emailVerificationToken -passwordResetToken'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let profileData = { user };

    // If student, get student profile
    if (user.role === 'student') {
      const student = await Student.findOne({ userId })
        .populate('enrolledCourses.courseId', 'title description price')
        .populate('enrolledCourses.learningPath');

      profileData.student = student;
    }

    logger.info(`User fetched own profile: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profileData,
    });
  } catch (error) {
    logger.error(`Error getting user profile: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  getUserStatistics,
  searchUsers,
  searchTeachers,
  getUserProfile,
};
