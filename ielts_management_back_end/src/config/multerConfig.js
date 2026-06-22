const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories
const subdirs = ['avatars', 'attachments'];
subdirs.forEach((dir) => {
  const subdir = path.join(uploadsDir, dir);
  if (!fs.existsSync(subdir)) {
    fs.mkdirSync(subdir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(uploadsDir, 'attachments');

    // Determine destination based on field name
    if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadsDir, 'avatars');
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Define allowed MIME types
  const allowedMimes = {
    avatar: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
    attachment: [
      'image/jpeg',
      'image/avif',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
  };

  let allowed = allowedMimes.attachment;
  if (file.fieldname === 'avatar' || file.fieldname === 'image') {
    allowed = allowedMimes.avatar;
  }

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Invalid file type for ${file.fieldname}. Only ${allowed.join(', ')} are allowed`)
    );
  }
};

// Size limits
const limits = {
  // Avatar: max 5MB
  // Attachments: max 50MB
  fileSize: 50 * 1024 * 1024, // 50MB
};

// Create multer instance for single file uploads
const upload = multer({
  storage,
  fileFilter,
  limits,
});

// Create multer instance for multiple file uploads
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = {
  upload,
  uploadMultiple,
};
