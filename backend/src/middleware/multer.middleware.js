import multer from "multer";
import path from "path";

// Max sizes (bytes). Keep these conservative to protect the Cloudinary quota.
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_VIDEO_MIME = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // Prefix with a timestamp so two users can't overwrite each other's temp
    // files by uploading the same original filename.
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

// Build a 400 error so the global handler returns a clean client error.
const rejection = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

// Reject anything that isn't an expected video/image for its field.
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "videoFile") {
    if (ALLOWED_VIDEO_MIME.includes(file.mimetype)) return cb(null, true);
    return cb(rejection("Invalid video format. Allowed: MP4, WebM, MOV"), false);
  }
  // avatar, coverImage, thumbnail -> images
  if (ALLOWED_IMAGE_MIME.includes(file.mimetype)) return cb(null, true);
  return cb(
    rejection("Invalid image format. Allowed: JPEG, PNG, WebP, GIF"),
    false
  );
};

// General uploader — used by routes that may include a video (publish video).
// fileSize must accommodate the largest allowed file (the video).
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_VIDEO_BYTES, files: 2 },
});

// Image-only uploader with a tighter size cap — used by avatar/cover/thumbnail
// routes so image uploads can't sneak up to the video size limit.
export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_BYTES, files: 2 },
});

export { MAX_VIDEO_BYTES, MAX_IMAGE_BYTES };
