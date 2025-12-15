import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { 
  Input, 
  Output, 
  Conversion,
  ALL_FORMATS,
  FilePathSource,
  FilePathTarget,
  Mp4OutputFormat,
  WebMOutputFormat,
  Mp3OutputFormat,
  WavOutputFormat
} from 'mediabunny';
import { MediaService } from './media.service.js';

interface ConversionOptions {
  fileId: string;
  outputFormat: string;
  codec?: string;
  bitrate?: number;
  quality?: number;
}

export class ConversionService {
  private mediaService = new MediaService();

  private getOutputFormat(format: string) {
    switch (format.toLowerCase()) {
      case 'mp4':
        return new Mp4OutputFormat();
      case 'webm':
        return new WebMOutputFormat();
      case 'mp3':
        return new Mp3OutputFormat();
      case 'wav':
      case 'wave':
        return new WavOutputFormat();
      default:
        throw new Error(`Unsupported output format: ${format}`);
    }
  }

  async convertMedia(options: ConversionOptions) {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const outputDir = process.env.OUTPUT_DIR || './output';
    
    const sourceFiles = await this.mediaService.findFileById(uploadDir, options.fileId);
    if (!sourceFiles.length) {
      throw new Error('Source file not found');
    }

    const sourcePath = sourceFiles[0];
    const outputId = uuidv4();
    const outputPath = path.join(outputDir, `${outputId}.${options.outputFormat}`);

    try {
      const input = new Input({
        source: new FilePathSource(sourcePath),
        formats: ALL_FORMATS
      });

      const output = new Output({
        format: this.getOutputFormat(options.outputFormat),
        target: new FilePathTarget(outputPath)
      });

      const conversion = await Conversion.init({ input, output });
      
      // Vérifier s'il y a des pistes abandonnées
      if (conversion.discardedTracks && conversion.discardedTracks.length > 0) {
        const discardedInfo = conversion.discardedTracks.map(dt => ({
          type: dt.track.constructor.name,
          reason: dt.reason
        }));
        
        console.warn('Tracks discarded:', JSON.stringify(discardedInfo, null, 2));
        
        // Lever une erreur claire pour l'utilisateur
        const reasons = discardedInfo.map(d => `${d.type}: ${d.reason}`).join(', ');
        throw new Error(
          `Cannot convert this file. Some tracks are not supported: ${reasons}. ` +
          `This is likely due to unsupported video/audio codecs. ` +
          `Supported codecs: H.264/AVC (video), AAC/MP3 (audio). ` +
          `Please convert your file to a compatible format first using FFmpeg.`
        );
      }
      
      // Exécuter la conversion
      await conversion.execute();

      return {
        outputId,
        outputPath: `/output/${path.basename(outputPath)}`,
        filename: path.basename(outputPath)
      };
    } catch (error: any) {
      // Nettoyer le fichier de sortie en cas d'erreur
      try {
        const fs = await import('fs/promises');
        await fs.unlink(outputPath).catch(() => {});
      } catch (cleanupError) {
        // Ignorer les erreurs de nettoyage
      }
      
      // Relancer l'erreur
      throw error;
    }
  }

  async extractAudio(fileId: string, outputFormat: string = 'mp3', bitrate?: number) {
    return this.convertMedia({
      fileId,
      outputFormat,
      bitrate
    });
  }

  async resizeVideo(fileId: string, width?: number, height?: number, maintainAspectRatio: boolean = true) {
    return this.convertMedia({
      fileId,
      outputFormat: 'mp4'
    });
  }

  async trimMedia(fileId: string, startTime: number, endTime: number) {
    return this.convertMedia({
      fileId,
      outputFormat: 'mp4'
    });
  }

  async rotateVideo(fileId: string, rotation: number) {
    return this.convertMedia({
      fileId,
      outputFormat: 'mp4'
    });
  }
}
