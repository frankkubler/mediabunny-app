import { Request, Response } from 'express';
import { FFmpegService } from '../services/ffmpeg.service.js';
import { conversionQueue } from '../queues/conversion.queue.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class FFmpegController {
  private ffmpegService = new FFmpegService();

  /**
   * Récupère les métadonnées d'un fichier
   */
  getMetadata = async (req: Request, res: Response) => {
    try {
      const { fileId } = req.params;
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      
      // Trouver le fichier
      const files = await this.findFilesByPrefix(uploadDir, fileId);
      if (!files.length) {
        return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
      }

      const metadata = await this.ffmpegService.getMetadata(files[0]);
      res.json({ success: true, metadata });
    } catch (error: any) {
      console.error('Erreur métadonnées:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * Conversion simple (synchrone pour fichiers < 100MB)
   */
  convertSync = async (req: Request, res: Response) => {
    try {
      const { fileId, outputFormat, videoCodec, audioCodec, videoBitrate, audioBitrate } = req.body;
      
      if (!fileId || !outputFormat) {
        return res.status(400).json({ success: false, message: 'fileId et outputFormat requis' });
      }

      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const outputDir = process.env.OUTPUT_DIR || './output';
      
      const files = await this.findFilesByPrefix(uploadDir, fileId);
      if (!files.length) {
        return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
      }

      const inputPath = files[0];
      const outputId = uuidv4();
      const outputPath = path.join(outputDir, `${outputId}.${outputFormat}`);

      await this.ffmpegService.convert(inputPath, outputPath, {
        outputFormat,
        videoCodec,
        audioCodec,
        videoBitrate,
        audioBitrate
      });

      res.json({
        success: true,
        outputId,
        outputPath: `/output/${path.basename(outputPath)}`,
        filename: path.basename(outputPath)
      });
    } catch (error: any) {
      console.error('Erreur conversion:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * Conversion asynchrone (via queue Bull pour gros fichiers)
   */
  convertAsync = async (req: Request, res: Response) => {
    try {
      const { fileId, outputFormat, videoCodec, audioCodec, videoBitrate, audioBitrate } = req.body;
      
      if (!fileId || !outputFormat) {
        return res.status(400).json({ success: false, message: 'fileId et outputFormat requis' });
      }

      const job = await conversionQueue.add('convert', {
        fileId,
        outputFormat,
        videoCodec,
        audioCodec,
        videoBitrate,
        audioBitrate
      });

      res.json({
        success: true,
        jobId: job.id,
        message: 'Conversion en cours',
        statusUrl: `/api/ffmpeg/job/${job.id}`
      });
    } catch (error: any) {
      console.error('Erreur création job:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * Status d'un job de conversion
   */
  getJobStatus = async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const job = await conversionQueue.getJob(jobId);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job non trouvé' });
      }

      const state = await job.getState();
      const progress = job.progress();
      const result = job.returnvalue;

      res.json({
        success: true,
        jobId: job.id,
        state,
        progress,
        result
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * Extraction audio
   */
  extractAudio = async (req: Request, res: Response) => {
    try {
      const { fileId, outputFormat = 'mp3', bitrate = '192k' } = req.body;
      
      if (!fileId) {
        return res.status(400).json({ success: false, message: 'fileId requis' });
      }

      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const outputDir = process.env.OUTPUT_DIR || './output';
      
      const files = await this.findFilesByPrefix(uploadDir, fileId);
      if (!files.length) {
        return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
      }

      const inputPath = files[0];
      const outputId = uuidv4();
      const outputPath = path.join(outputDir, `${outputId}.${outputFormat}`);

      await this.ffmpegService.extractAudio(inputPath, outputPath, {
        codec: outputFormat === 'mp3' ? 'libmp3lame' : 'aac',
        bitrate
      });

      res.json({
        success: true,
        outputId,
        outputPath: `/output/${path.basename(outputPath)}`,
        filename: path.basename(outputPath)
      });
    } catch (error: any) {
      console.error('Erreur extraction audio:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * Redimensionnement
   */
  resize = async (req: Request, res: Response) => {
    try {
      const { fileId, width, height, maintainAspectRatio = true } = req.body;
      
      if (!fileId || (!width && !height)) {
        return res.status(400).json({ success: false, message: 'fileId et width/height requis' });
      }

      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const outputDir = process.env.OUTPUT_DIR || './output';
      
      const files = await this.findFilesByPrefix(uploadDir, fileId);
      if (!files.length) {
        return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
      }

      const inputPath = files[0];
      const outputId = uuidv4();
      const outputPath = path.join(outputDir, `${outputId}.mp4`);

      await this.ffmpegService.resize(inputPath, outputPath, width, height, maintainAspectRatio);

      res.json({
        success: true,
        outputId,
        outputPath: `/output/${path.basename(outputPath)}`,
        filename: path.basename(outputPath)
      });
    } catch (error: any) {
      console.error('Erreur resize:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * Découpage
   */
  trim = async (req: Request, res: Response) => {
    try {
      const { fileId, startTime, endTime } = req.body;
      
      if (!fileId || startTime === undefined || endTime === undefined) {
        return res.status(400).json({ success: false, message: 'fileId, startTime et endTime requis' });
      }

      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const outputDir = process.env.OUTPUT_DIR || './output';
      
      const files = await this.findFilesByPrefix(uploadDir, fileId);
      if (!files.length) {
        return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
      }

      const inputPath = files[0];
      const outputId = uuidv4();
      const ext = path.extname(inputPath);
      const outputPath = path.join(outputDir, `${outputId}${ext}`);

      await this.ffmpegService.trim(inputPath, outputPath, startTime, endTime);

      res.json({
        success: true,
        outputId,
        outputPath: `/output/${path.basename(outputPath)}`,
        filename: path.basename(outputPath)
      });
    } catch (error: any) {
      console.error('Erreur trim:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * Rotation
   */
  rotate = async (req: Request, res: Response) => {
    try {
      const { fileId, rotation } = req.body;
      
      if (!fileId || ![90, 180, 270].includes(rotation)) {
        return res.status(400).json({ success: false, message: 'fileId et rotation (90, 180, 270) requis' });
      }

      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const outputDir = process.env.OUTPUT_DIR || './output';
      
      const files = await this.findFilesByPrefix(uploadDir, fileId);
      if (!files.length) {
        return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
      }

      const inputPath = files[0];
      const outputId = uuidv4();
      const outputPath = path.join(outputDir, `${outputId}.mp4`);

      await this.ffmpegService.rotate(inputPath, outputPath, rotation);

      res.json({
        success: true,
        outputId,
        outputPath: `/output/${path.basename(outputPath)}`,
        filename: path.basename(outputPath)
      });
    } catch (error: any) {
      console.error('Erreur rotation:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * Création de miniature
   */
  createThumbnail = async (req: Request, res: Response) => {
    try {
      const { fileId, timestamp = 1, size = '320x240' } = req.body;
      
      if (!fileId) {
        return res.status(400).json({ success: false, message: 'fileId requis' });
      }

      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const outputDir = process.env.OUTPUT_DIR || './output';
      
      const files = await this.findFilesByPrefix(uploadDir, fileId);
      if (!files.length) {
        return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
      }

      const inputPath = files[0];
      const outputId = uuidv4();
      const outputPath = path.join(outputDir, `${outputId}.jpg`);

      await this.ffmpegService.createThumbnail(inputPath, outputPath, timestamp, size);

      res.json({
        success: true,
        outputId,
        outputPath: `/output/${path.basename(outputPath)}`,
        filename: path.basename(outputPath)
      });
    } catch (error: any) {
      console.error('Erreur miniature:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Helper
  private async findFilesByPrefix(directory: string, prefix: string): Promise<string[]> {
    const fs = await import('fs/promises');
    const files = await fs.readdir(directory);
    const matchedFiles = files.filter(file => file.startsWith(prefix));
    return matchedFiles.map(file => path.join(directory, file));
  }
}
