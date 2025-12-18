import api from './api';

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
  fileId: string;
  outputFormat: string;
  videoCodec?: string;
  audioCodec?: string;
  videoBitrate?: string;
  audioBitrate?: string;
  width?: number;
  height?: number;
  startTime?: number;
  duration?: number;
  rotation?: number;
}

export interface JobStatus {
  jobId: string;
  state: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  result?: {
    outputId: string;
    outputPath: string;
    filename: string;
  };
}

class FFmpegAPI {
  /**
   * Upload un fichier
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });

    return response.data;
  }

  /**
   * Récupère les métadonnées
   */
  async getMetadata(fileId: string): Promise<FFmpegMetadata> {
    const response = await api.get(`/ffmpeg/metadata/${fileId}`);
    return response.data.metadata;
  }

  /**
   * Conversion synchrone
   */
  async convert(options: ConversionOptions) {
    const response = await api.post('/ffmpeg/convert', options);
    return response.data;
  }

  /**
   * Conversion asynchrone (gros fichiers)
   */
  async convertAsync(options: ConversionOptions) {
    const response = await api.post('/ffmpeg/convert/async', options);
    return response.data;
  }

  /**
   * Status d'un job
   */
  async getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await api.get(`/ffmpeg/job/${jobId}`);
    return response.data;
  }

  /**
   * Extraction audio
   */
  async extractAudio(fileId: string, outputFormat: string = 'mp3', bitrate: string = '192k') {
    const response = await api.post('/ffmpeg/extract-audio', {
      fileId,
      outputFormat,
      bitrate
    });
    return response.data;
  }

  /**
   * Redimensionnement
   */
  async resize(fileId: string, width?: number, height?: number, maintainAspectRatio: boolean = true) {
    const response = await api.post('/ffmpeg/resize', {
      fileId,
      width,
      height,
      maintainAspectRatio
    });
    return response.data;
  }

  /**
   * Découpage
   */
  async trim(fileId: string, startTime: number, endTime: number) {
    const response = await api.post('/ffmpeg/trim', {
      fileId,
      startTime,
      endTime
    });
    return response.data;
  }

  /**
   * Rotation
   */
  async rotate(fileId: string, rotation: number) {
    const response = await api.post('/ffmpeg/rotate', {
      fileId,
      rotation
    });
    return response.data;
  }

  /**
   * Miniature
   */
  async createThumbnail(fileId: string, timestamp: number = 1, size: string = '640x360') {
    const response = await api.post('/ffmpeg/thumbnail', {
      fileId,
      timestamp,
      size
    });
    return response.data;
  }

  /**
   * Télécharger un fichier de sortie
   */
  getDownloadUrl(outputPath: string): string {
    // Utilise l'origine courante pour éviter les soucis de CORS/hosts (nginx, reverse proxy)
    const base = window.location.origin;
    return `${base}${outputPath}`;
  }
}

export const ffmpegAPI = new FFmpegAPI();
