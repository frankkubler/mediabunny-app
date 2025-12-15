import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska',
    'audio/mpeg', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/ogg',
    'audio/flac', 'audio/aac', 'audio/x-m4a'
  ];
  
  if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(mp4|mov|webm|mkv|mp3|wav|ogg|flac|aac|m4a)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '500000000') // 500MB par défaut
  }
});
