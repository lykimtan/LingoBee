const Note = require('../models/Note');
const { Types } = require('mongoose');

// Get notes for a specific video and student
exports.getNotesByVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const studentId = req.user._id;

    const notes = await Note.find({
      videoId: videoId,
      studentId: studentId
    }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: notes
    });
  } catch (error) {
    next(error);
  }
};

// Create a new note
exports.createNote = async (req, res, next) => {
  try {
    const { videoId, courseId, timestamp, content } = req.body;
    const studentId = req.user._id;

    if (!videoId || !courseId || timestamp === undefined || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide videoId, courseId, timestamp and content'
      });
    }

    const note = await Note.create({
      studentId,
      videoId,
      courseId,
      timestamp,
      content
    });

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// Update a note
exports.updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const studentId = req.user._id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide note content'
      });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, studentId: studentId },
      { content: content },
      { returnDocument: 'after', runValidators: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// Delete a note
exports.deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const note = await Note.findOneAndDelete({
      _id: id,
      studentId: studentId
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
