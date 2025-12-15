import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export interface ConversionResult {
  outputId: string;
  outputPath: string;
  filename: string;
}

export const useConversionStore = defineStore('conversion', () => {
  const converting = ref(false);
  const progress = ref(0);
  const error = ref<string | null>(null);
  const history = ref<ConversionResult[]>([]);

  async function convertMedia(options: {
    fileId: string;
    outputFormat: string;
    codec?: string;
    bitrate?: number;
  }): Promise<ConversionResult> {
    converting.value = true;
    error.value = null;
    progress.value = 0;

    try {
      const response = await api.post('/conversion/convert', options);
      
      if (response.data.success) {
        const result = {
          outputId: response.data.outputId,
          outputPath: response.data.outputPath,
          filename: response.data.filename
        };
        history.value.unshift(result);
        progress.value = 100;
        return result;
      }
      throw new Error('Conversion failed');
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      converting.value = false;
    }
  }

  async function extractAudio(fileId: string, outputFormat: string = 'mp3') {
    converting.value = true;
    error.value = null;

    try {
      const response = await api.post('/conversion/extract-audio', {
        fileId,
        outputFormat
      });
      
      if (response.data.success) {
        const result = {
          outputId: response.data.outputId,
          outputPath: response.data.outputPath,
          filename: response.data.filename
        };
        history.value.unshift(result);
        return result;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      converting.value = false;
    }
  }

  async function trimMedia(fileId: string, startTime: number, endTime: number) {
    converting.value = true;
    error.value = null;

    try {
      const response = await api.post('/conversion/trim', {
        fileId,
        startTime,
        endTime
      });
      
      if (response.data.success) {
        const result = {
          outputId: response.data.outputId,
          outputPath: response.data.outputPath,
          filename: response.data.filename
        };
        history.value.unshift(result);
        return result;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      converting.value = false;
    }
  }

  return {
    converting,
    progress,
    error,
    history,
    convertMedia,
    extractAudio,
    trimMedia
  };
});
