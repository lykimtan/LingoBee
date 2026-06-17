const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

const allowedResourceTypes = new Set(['image', 'video', 'raw']);
const allowedFolders = new Set(['avatars', 'videos', 'thumbnails', 'audios', 'materials', 'flashcard', 'flashcards']);

const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    //eslint-disable-next-line
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const match = pathname.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (match && match[1]) {
      return match[1].replace(/\.[^.]+$/, '');
    }
  } catch {
    return null;
  }

  return null;
};

const deleteCloudinaryAsset = async (url, resourceType = 'image') => {
  if (!url) {
    return;
  }

  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.api.delete_resources([publicId], { resource_type: resourceType });
    logger.info(`Deleted Cloudinary asset: ${publicId}`);
  } catch (error) {
    logger.warn(`Failed to delete Cloudinary asset ${publicId}: ${error.message}`);
  }
};

const getUploadSignature = async (req, res) => {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary is not configured on the server',
      });
    }

    const { resourceType = 'image', folder } = req.body || {};

    if (!allowedResourceTypes.has(resourceType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resource type. Only image, video or raw is allowed.',
      });
    }

    const defaultFolder = resourceType === 'video' ? 'videos' : 'avatars';
    const targetFolder = allowedFolders.has(folder) ? folder : defaultFolder;

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = {
      timestamp,
      folder: targetFolder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      success: true,
      message: 'Upload signature generated successfully',
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || null,
        folder: targetFolder,
        resourceType,
      },
    });
  } catch (error) {
    logger.error(`Upload signature error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate upload signature',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const deleteUpload = async (req, res) => {
  try {
    const url = (req.query?.url || req.body?.url || '').toString();
    const resourceType = (req.query?.resourceType || req.body?.resourceType || 'video').toString();

    if (!url) {
      return res.status(400).json({ success: false, message: 'Missing url to delete' });
    }

    await deleteCloudinaryAsset(url, resourceType);

    return res.status(200).json({ success: true, message: 'Asset deletion triggered' });
  } catch (error) {
    logger.error(`Error deleting upload: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Failed to delete asset' });
  }
};

module.exports = {
  getUploadSignature,
  deleteCloudinaryAsset,
  deleteUpload,
};
