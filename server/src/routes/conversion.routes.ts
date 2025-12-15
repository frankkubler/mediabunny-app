import express from 'express';
import { ConversionController } from '../controllers/conversion.controller.js';

const router = express.Router();
const controller = new ConversionController();

router.post('/convert', controller.convertMedia);
router.post('/extract-audio', controller.extractAudio);
router.post('/resize', controller.resizeVideo);
router.post('/trim', controller.trimMedia);
router.post('/rotate', controller.rotateVideo);

export default router;
