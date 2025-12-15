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
      res.status(500).json({ success: false, message: error.message });
    }
  };

  extractAudio = async (req: Request, res: Response) => {
    try {
      const { fileId, outputFormat = 'mp3', bitrate } = req.body;
      
      const result = await this.conversionService.extractAudio(fileId, outputFormat, bitrate);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  resizeVideo = async (req: Request, res: Response) => {
    try {
      const { fileId, width, height, maintainAspectRatio = true } = req.body;
      
      const result = await this.conversionService.resizeVideo(
        fileId, 
        width, 
        height, 
        maintainAspectRatio
      );
      
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  trimMedia = async (req: Request, res: Response) => {
    try {
      const { fileId, startTime, endTime } = req.body;
      
      if (startTime === undefined || endTime === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: 'startTime and endTime are required' 
        });
      }

      const result = await this.conversionService.trimMedia(fileId, startTime, endTime);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  rotateVideo = async (req: Request, res: Response) => {
    try {
      const { fileId, rotation } = req.body;
      
      const result = await this.conversionService.rotateVideo(fileId, rotation);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
