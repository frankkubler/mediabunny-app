import { Request, Response } from 'express';
import { MediaService } from '../services/media.service.js';
import path from 'path';

export class MediaController {
  private mediaService = new MediaService();

  uploadFile = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const metadata = await this.mediaService.getFileMetadata(req.file.path);
      
      res.json({
        success: true,
        file: {
          id: path.parse(req.file.filename).name,
          originalName: req.file.originalname,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: req.file.path,
          metadata
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getMetadata = async (req: Request, res: Response) => {
    try {
      const { fileId } = req.params;
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const files = await this.mediaService.findFileById(uploadDir, fileId);
      
      if (!files.length) {
        return res.status(404).json({ success: false, message: 'File not found' });
      }

      const metadata = await this.mediaService.getFileMetadata(files[0]);
      res.json({ success: true, metadata });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  deleteFile = async (req: Request, res: Response) => {
    try {
      const { fileId } = req.params;
      await this.mediaService.deleteFileById(fileId);
      res.json({ success: true, message: 'File deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  listFiles = async (req: Request, res: Response) => {
    try {
      const files = await this.mediaService.listAllFiles();
      res.json({ success: true, files });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
