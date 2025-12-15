import { Request, Response } from 'express';
import { ConversionService } from '../services/conversion.service.js';

export class ConversionController {
  private conversionService = new ConversionService();

  convertMedia = async (req: Request, res: Response) => {
    try {
      const { fileId, outputFormat, codec, bitrate, quality } = req.body;
      
      if (!fileId || !outputFormat) {
        return res.status(400).json({ 
          success: false, 
          message: 'fileId and outputFormat are required' 
        });
      }

      const result = await this.conversionService.convertMedia({
        fileId,
        outputFormat,
        codec,
        bitrate,
        quality
      });

      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Conversion error:', error.message);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Conversion failed'
      });
    }
  };

  extractAudio = async (req: Request, res: Response) => {
    try {
      const { fileId, outputFormat = 'mp3', bitrate } = req.body;
      
      if (!fileId) {
        return res.status(400).json({ 
          success: false, 
          message: 'fileId is required' 
        });
      }
      
      const result = await this.conversionService.extractAudio(fileId, outputFormat, bitrate);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Audio extraction error:', error.message);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Audio extraction failed'
      });
    }
  };

  resizeVideo = async (req: Request, res: Response) => {
    try {
      const { fileId, width, height, maintainAspectRatio = true } = req.body;
      
      if (!fileId) {
        return res.status(400).json({ 
          success: false, 
          message: 'fileId is required' 
        });
      }
      
      const result = await this.conversionService.resizeVideo(
        fileId, 
        width, 
        height, 
        maintainAspectRatio
      );
      
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Resize error:', error.message);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Resize failed'
      });
    }
  };

  trimMedia = async (req: Request, res: Response) => {
    try {
      const { fileId, startTime, endTime } = req.body;
      
      if (!fileId || startTime === undefined || endTime === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: 'fileId, startTime and endTime are required' 
        });
      }

      const result = await this.conversionService.trimMedia(fileId, startTime, endTime);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Trim error:', error.message);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Trim failed'
      });
    }
  };

  rotateVideo = async (req: Request, res: Response) => {
    try {
      const { fileId, rotation } = req.body;
      
      if (!fileId) {
        return res.status(400).json({ 
          success: false, 
          message: 'fileId is required' 
        });
      }
      
      const result = await this.conversionService.rotateVideo(fileId, rotation);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Rotate error:', error.message);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Rotate failed'
      });
    }
  };
}
