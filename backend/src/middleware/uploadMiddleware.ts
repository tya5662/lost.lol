import multer from 'multer';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

// Keep uploads in memory because the current profile model stores media in MongoDB.
// Explicit validation prevents unsupported files and oversized images from becoming
// opaque Multer/Mongo errors that the dashboard displays as "Something broke!".
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 3,
    fields: 40,
    parts: 45,
  },
  fileFilter: (_req, file, callback) => {
    if (file.fieldname === 'profilePicture' && !file.mimetype.startsWith('image/')) {
      callback(new Error('Profile picture must be an image (JPG, PNG, WebP, GIF, or another supported image format).'));
      return;
    }

    if (file.fieldname === 'backgroundMedia' &&
      !file.mimetype.startsWith('image/') &&
      !file.mimetype.startsWith('video/')) {
      callback(new Error('Background media must be an image or video.'));
      return;
    }

    if (file.fieldname === 'audioFile' && ![
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac',
    ].includes(file.mimetype)) {
      callback(new Error('Music must be an MP3 or supported audio file.'));
      return;
    }

    callback(null, true);
  },
});
