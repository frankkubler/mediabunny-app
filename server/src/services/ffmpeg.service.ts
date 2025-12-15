import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

export interface FFmpegMetadata {
  duration: number;
  format: string;
  size: number;
  bitrate: number;
  video?: {
    codec: string;
    width: number;
    height: number;
    fps: number;
    bitrate: number;
  };
  audio?: {
    codec: string;
    sampleRate: number;
    channels: number;
    bitrate: number;
  };
}

export interface ConversionOptions {
  outputFormat?: string;
  videoCodec?: string;
  audioCodec?: string;
  videoBitrate?: string;
  audioBitrate?: string;
  fps?: number;
  width?: number;
  height?: number;
  startTime?: number;
  duration?: number;
  rotation?: number;
  quality?: number;
}

export class FFmpegService {
  /**
   * Extrait les métadonnées d'un fichier vidéo/audio
   */
  async getMetadata(filePath: string): Promise<FFmpegMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(new Error(`Erreur lecture métadonnées: ${err.message}`));
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

        resolve({
          duration: metadata.format.duration || 0,
          format: metadata.format.format_name || '',
          size: metadata.format.size || 0,
          bitrate: metadata.format.bit_rate || 0,
          video: videoStream ? {
            codec: videoStream.codec_name || '',
            width: videoStream.width || 0,
            height: videoStream.height || 0,
            fps: this.parseFPS(videoStream.r_frame_rate),
            bitrate: parseInt(videoStream.bit_rate || '0')
          } : undefined,
          audio: audioStream ? {
            codec: audioStream.codec_name || '',
            sampleRate: audioStream.sample_rate || 0,
            channels: audioStream.channels || 0,
            bitrate: parseInt(audioStream.bit_rate || '0')
          } : undefined
        });
      });
    });
  }

  /**
   * Convertit un fichier avec FFmpeg
   */
  async convert(
    inputPath: string,
    outputPath: string,
    options: ConversionOptions = {},
    onProgress?: (percent: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      // Format de sortie
      if (options.outputFormat) {
        command = command.format(options.outputFormat);
      }

      // Validation et correction des codecs selon le format de sortie
      let videoCodec = options.videoCodec;
      let audioCodec = options.audioCodec;

      // Correction automatique pour WebM
      if (options.outputFormat === 'webm') {
        if (!videoCodec || (videoCodec !== 'libvpx' && videoCodec !== 'libvpx-vp9')) {
          videoCodec = 'libvpx-vp9';
          console.log('[FFmpegService] Codec vidéo corrigé pour WebM:', videoCodec);
        }
        if (!audioCodec || (audioCodec !== 'libvorbis' && audioCodec !== 'libopus')) {
          audioCodec = 'libopus';
          console.log('[FFmpegService] Codec audio corrigé pour WebM:', audioCodec);
        }
      }

      // Codecs
      if (videoCodec) {
        command = command.videoCodec(videoCodec);
      }
      if (audioCodec) {
        command = command.audioCodec(audioCodec);
      }

      // Bitrates (validation/correction)
      if (options.videoBitrate) {
        let videoBitrate = options.videoBitrate;
        // Correction avancée : accepte '2Mk', '2000kk', '2m', '2000K', etc.
        videoBitrate = videoBitrate.trim();
        // Corrige les cas comme '2Mk' => '2M', '2000kk' => '2000k', etc.
        videoBitrate = videoBitrate.replace(/([0-9]+)Mk$/i, '$1M');
        videoBitrate = videoBitrate.replace(/([0-9]+)kk$/i, '$1k');
        videoBitrate = videoBitrate.replace(/([0-9]+)[mM]$/i, '$1M');
        videoBitrate = videoBitrate.replace(/([0-9]+)[kK]$/i, '$1k');
        // Si la valeur n'est pas au format attendu, fallback à 1000k
        if (!/^([0-9]+)(k|M)$/i.test(videoBitrate)) {
          videoBitrate = '1000k';
        }
        // Log la valeur utilisée
        console.log('[FFmpegService] Bitrate vidéo utilisé :', videoBitrate);
        // Utilisation de outputOptions pour éviter les transformations de fluent-ffmpeg
        command = command.outputOptions([`-b:v ${videoBitrate}`]);
      }
      if (options.audioBitrate) {
        let audioBitrate = options.audioBitrate;
        audioBitrate = audioBitrate.replace(/([0-9]+)kk$/i, '$1k');
        if (!/^([0-9]+)(k|M)$/i.test(audioBitrate)) {
          audioBitrate = '192k';
        }
        command = command.outputOptions([`-b:a ${audioBitrate}`]);
      }

      // FPS
      if (options.fps) {
        command = command.fps(options.fps);
      }

      // Redimensionnement
      if (options.width || options.height) {
        const size = `${options.width || '?'}x${options.height || '?'}`;
        command = command.size(size);
      }

      // Découpage (trim)
      if (options.startTime !== undefined) {
        command = command.setStartTime(options.startTime);
      }
      if (options.duration !== undefined) {
        command = command.setDuration(options.duration);
      }

      // Rotation
      if (options.rotation) {
        const transpose = this.getTransposeFilter(options.rotation);
        if (transpose) {
          command = command.videoFilters(transpose);
        }
      }

      // Qualité (CRF pour H.264)
      if (options.quality && options.videoCodec === 'libx264') {
        command = command.addOption('-crf', options.quality.toString());
      }

      // Progression
      if (onProgress) {
        command.on('progress', (progress) => {
          if (progress.percent) {
            onProgress(Math.round(progress.percent));
          }
        });
      }

      // Exécution
      command
        .on('end', () => resolve())
        .on('error', (err, stdout, stderr) => {
          // Log détaillé de l'erreur FFmpeg
          console.error('Erreur FFmpeg détaillée:', {
            message: err.message,
            stdout,
            stderr
          });
          reject(new Error(`Erreur FFmpeg: ${err.message}\nSTDERR: ${stderr}`));
        })
        .save(outputPath);
    });
  }

  /**
   * Extrait l'audio d'une vidéo
   */
  async extractAudio(
    inputPath: string,
    outputPath: string,
    options: { codec?: string; bitrate?: string } = {}
  ): Promise<void> {
    return this.convert(inputPath, outputPath, {
      audioCodec: options.codec || 'libmp3lame',
      audioBitrate: options.bitrate || '192k',
      outputFormat: path.extname(outputPath).slice(1)
    });
  }

  /**
   * Redimensionne une vidéo
   */
  async resize(
    inputPath: string,
    outputPath: string,
    width?: number,
    height?: number,
    maintainAspectRatio: boolean = true
  ): Promise<void> {
    return this.convert(inputPath, outputPath, {
      width: maintainAspectRatio && height ? undefined : width,
      height,
      videoCodec: 'libx264',
      audioCodec: 'aac'
    });
  }

  /**
   * Découpe une vidéo
   */
  async trim(
    inputPath: string,
    outputPath: string,
    startTime: number,
    endTime: number
  ): Promise<void> {
    return this.convert(inputPath, outputPath, {
      startTime,
      duration: endTime - startTime,
      videoCodec: 'copy',
      audioCodec: 'copy'
    });
  }

  /**
   * Fait pivoter une vidéo
   */
  async rotate(
    inputPath: string,
    outputPath: string,
    degrees: number
  ): Promise<void> {
    return this.convert(inputPath, outputPath, {
      rotation: degrees,
      videoCodec: 'libx264',
      audioCodec: 'aac'
    });
  }

  /**
   * Crée une miniature
   */
  async createThumbnail(
    inputPath: string,
    outputPath: string,
    timestamp: number = 1,
    size: string = '320x240'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`Erreur miniature: ${err.message}`)));
    });
  }

  /**
   * Concatène plusieurs vidéos
   */
  async concatenate(
    inputPaths: string[],
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg();

      inputPaths.forEach(input => {
        command = command.input(input);
      });

      // mergeToFile nécessite un dossier temporaire
      const tmpDir = os.tmpdir();

      command
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`Erreur concaténation: ${err.message}`)))
        .mergeToFile(outputPath, tmpDir);
    });
  }

  // Helpers privés

  private parseFPS(rFrameRate?: string): number {
    if (!rFrameRate) return 0;
    const [num, den] = rFrameRate.split('/').map(Number);
    return den ? num / den : num;
  }

  private getTransposeFilter(degrees: number): string | null {
    switch (degrees) {
      case 90: return 'transpose=1';
      case 180: return 'transpose=2,transpose=2';
      case 270: return 'transpose=2';
      default: return null;
    }
  }
}
