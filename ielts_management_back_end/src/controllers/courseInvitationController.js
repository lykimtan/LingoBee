const { Course, CourseInvitation, Notification, User } = require('../models');
const { emitNotification } = require('../socket');
const logger = require('../utils/logger');
const { sendEmail } = require('../services/apiService');

/**
 * @desc    Invite a teacher to a course
 * @route   POST /api/courses/:id/invitations
 * @access  Private/Admin
 */
const inviteTeacherToCourse = async (req, res, next) => {
  try {
    const { teacherId, message } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const teacherUser = await User.findById(teacherId);
    if (!teacherUser || teacherUser.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID or user is not a teacher',
      });
    }

    const existingInvite = await CourseInvitation.findOne({
      course: course._id,
      teacher: teacherUser._id,
      status: 'pending',
    });
    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'Teacher already has a pending invitation for this course',
      });
    }

    const invitation = await CourseInvitation.create({
      course: course._id,
      teacher: teacherUser._id,
      invitedBy: req.user.id,
      message: message || '',
      status: 'pending',
    });

    course.teacher = teacherUser._id;
    course.status = 'invited';
    course.isPublished = false;
    await course.save();

    const notification = await Notification.create({
      recipientUser: teacherUser._id,
      courseId: course._id,
      notificationType: 'course_invitation',
      relatedEntity: { type: 'course_invitation', id: invitation._id },
      title: 'Course invitation',
      message: message || `You have been invited to teach ${course.title}.`,
      actionUrl: `/courses/invitations/${invitation._id}`,
    });

    emitNotification(notification);

    logger.info(`Course invitation created by ${req.user.id}: ${invitation._id}`);

    res.status(201).json({
      success: true,
      message: 'Invitation created successfully',
      data: invitation,
    });
  } catch (error) {
    logger.error(`Error in inviteTeacherToCourse: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Invite an assistant teacher to a course
 * @route   POST /api/courses/:id/assistants/invite
 * @access  Private/Teacher
 */
const inviteAssistantToCourse = async (req, res, next) => {
  try {
    const { teacherId, message } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the primary teacher can invite assistants',
      });
    }

    const teacherUser = await User.findById(teacherId);
    if (!teacherUser || teacherUser.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID or user is not a teacher',
      });
    }

    if (course.teacher.toString() === teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot invite the primary teacher as an assistant',
      });
    }

    if (course.teachingAssistants && course.teachingAssistants.includes(teacherId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a teaching assistant for this course',
      });
    }

    const existingInvite = await CourseInvitation.findOne({
      course: course._id,
      teacher: teacherUser._id,
      status: 'pending',
    });
    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'Teacher already has a pending invitation for this course',
      });
    }

    const invitation = await CourseInvitation.create({
      course: course._id,
      teacher: teacherUser._id,
      invitedBy: req.user.id,
      message: message || '',
      status: 'pending',
      role: 'assistant',
    });

    const notification = await Notification.create({
      recipientUser: teacherUser._id,
      courseId: course._id,
      notificationType: 'course_invitation',
      relatedEntity: { type: 'course_invitation', id: invitation._id },
      title: 'Trợ giảng khóa học',
      message: message || `Bạn nhận được lời mời làm trợ giảng cho khóa học ${course.title}.`,
      actionUrl: `/teacher/courses`,
    });

    emitNotification(notification);

    try {
      const senderUser = await User.findById(req.user.id);
      await sendEmail(
        teacherUser.email,
        `Lời mời trợ giảng: ${course.title}`,
        'course_invitation',
        {
          name: teacherUser.firstName || 'Giáo viên',
          courseName: course.title,
          senderName: senderUser ? `${senderUser.firstName} ${senderUser.lastName}`.trim() : 'Một giáo viên',
          actionUrl: `${process.env.FRONTEND_URL}/teacher/courses`,
        }
      );
    } catch (emailError) {
      logger.error(`Failed to send invitation email to ${teacherUser.email}: ${emailError.message}`);
    }

    logger.info(`Course assistant invitation created by ${req.user.id}: ${invitation._id}`);

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: invitation,
    });
  } catch (error) {
    logger.error(`Error in inviteAssistantToCourse: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Accept a course invitation
 * @route   POST /api/courses/invitations/:id/accept
 * @access  Private/Teacher
 */
const acceptCourseInvitation = async (req, res, next) => {
  try {
    const invitation = await CourseInvitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
    }

    if (invitation.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to accept this invitation',
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invitation is not pending',
      });
    }

    invitation.status = 'accepted';
    invitation.respondedAt = new Date();
    await invitation.save();

    if (invitation.role === 'assistant') {
      await Course.findByIdAndUpdate(invitation.course, {
        $addToSet: { teachingAssistants: invitation.teacher },
      });
    } else {
      await Course.findByIdAndUpdate(invitation.course, {
        status: 'accepted',
        teacher: invitation.teacher,
        isPublished: false,
      });
    }

    const notification = await Notification.create({
      recipientUser: invitation.invitedBy,
      courseId: invitation.course,
      notificationType: 'course_invitation',
      relatedEntity: { type: 'course_invitation', id: invitation._id },
      title: 'Invitation accepted',
      message: 'The teacher accepted your course invitation.',
      actionUrl: `/courses/${invitation.course}`,
    });

    emitNotification(notification);

    logger.info(`Course invitation accepted by ${req.user.id}: ${invitation._id}`);

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      data: invitation,
    });
  } catch (error) {
    logger.error(`Error in acceptCourseInvitation: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Reject a course invitation
 * @route   POST /api/courses/invitations/:id/reject
 * @access  Private/Teacher
 */
const rejectCourseInvitation = async (req, res, next) => {
  try {
    const invitation = await CourseInvitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
    }

    if (invitation.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to reject this invitation',
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invitation is not pending',
      });
    }

    invitation.status = 'rejected';
    invitation.respondedAt = new Date();
    await invitation.save();

    await Course.findByIdAndUpdate(invitation.course, {
      status: 'draft',
      isPublished: false,
    });

    const notification = await Notification.create({
      recipientUser: invitation.invitedBy,
      courseId: invitation.course,
      notificationType: 'course_invitation',
      relatedEntity: { type: 'course_invitation', id: invitation._id },
      title: 'Invitation rejected',
      message: 'The teacher rejected your course invitation.',
      actionUrl: `/courses/${invitation.course}`,
    });

    emitNotification(notification);

    logger.info(`Course invitation rejected by ${req.user.id}: ${invitation._id}`);

    res.status(200).json({
      success: true,
      message: 'Invitation rejected successfully',
      data: invitation,
    });
  } catch (error) {
    logger.error(`Error in rejectCourseInvitation: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get course invitations for current teacher
 * @route   GET /api/courses/invitations
 * @access  Private/Teacher
 */
const getMyCourseInvitations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { teacher: req.user.id };
    if (status) {
      query.status = status;
    }

    const invitations = await CourseInvitation.find(query)
      .populate('course', 'title category level status')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations,
    });
  } catch (error) {
    logger.error(`Error in getMyCourseInvitations: ${error.message}`);
    next(error);
  }
};

module.exports = {
  inviteTeacherToCourse,
  inviteAssistantToCourse,
  acceptCourseInvitation,
  rejectCourseInvitation,
  getMyCourseInvitations,
};
