import express from 'express';
import { upload } from '../middleware/upload.js';
import { MediaController } from '../controllers/media.controller.js';

const router = express.Router();
const controller = new MediaController();

router.post('/upload', upload.single('file'), controller.uploadFile);
router.get('/metadata/:fileId', controller.getMetadata);
router.delete('/:fileId', controller.deleteFile);
router.get('/list', controller.listFiles);

export default router;
