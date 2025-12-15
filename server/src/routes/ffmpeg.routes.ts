import express from 'express';
import { FFmpegController } from '../controllers/ffmpeg.controller.js';

const router = express.Router();
const controller = new FFmpegController();

// Métadonnées
router.get('/metadata/:fileId', controller.getMetadata);

// Conversion synchrone (fichiers < 100MB)
router.post('/convert', controller.convertSync);

// Conversion asynchrone (gros fichiers)
router.post('/convert/async', controller.convertAsync);

// Status d'un job
router.get('/job/:jobId', controller.getJobStatus);

// Extraction audio
router.post('/extract-audio', controller.extractAudio);

// Redimensionnement
router.post('/resize', controller.resize);

// Découpage
router.post('/trim', controller.trim);

// Rotation
router.post('/rotate', controller.rotate);

// Miniature
router.post('/thumbnail', controller.createThumbnail);

export default router;
