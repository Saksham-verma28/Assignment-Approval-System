const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

const UPLOAD_BASE_DIR = 'uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const token = req.cookies['User'];

    if (!token) {
      return cb(new Error("Authentication token missing."));
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return cb(new Error("Invalid or expired authentication token."));
      }

      const userDir = path.join(UPLOAD_BASE_DIR, decoded.name);

      if (!fs.existsSync(userDir)) {
        try {
          fs.mkdirSync(userDir, { recursive: true });
        } catch (mkdirError) {
          return cb(mkdirError);
        }
      }

      cb(null, userDir);
    });
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});


const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;