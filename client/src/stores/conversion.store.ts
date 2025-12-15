import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ffmpegAPI, type FFmpegMetadata } from '@/services/ffmpeg.api';

export const useConversionStore = defineStore('conversion', () => {
  const currentFile = ref<File | null>(null);
  const fileId = ref<string | null>(null);
  const metadata = ref<FFmpegMetadata | null>(null);
  const uploading = ref(false);
  const uploadProgress = ref(0);
  const converting = ref(false);
  const conversionProgress = ref(0);
  const error = ref<string | null>(null);
  const result = ref<any>(null);
  const jobId = ref<string | null>(null);

  async function uploadFile(file: File) {
    currentFile.value = file;
    uploading.value = true;
    uploadProgress.value = 0;
    error.value = null;

    try {
      const response = await ffmpegAPI.uploadFile(file, (progress) => {
        uploadProgress.value = progress;
      });

      fileId.value = response.file.id;
      
      // Charger les métadonnées
      await loadMetadata(response.file.id);

      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      uploading.value = false;
    }
  }

  async function loadMetadata(id: string) {
    try {
      metadata.value = await ffmpegAPI.getMetadata(id);
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
    }
  }

  async function convert(options: any) {
    if (!fileId.value) return;

    converting.value = true;
    conversionProgress.value = 0;
    error.value = null;
    result.value = null;

    try {
      const response = await ffmpegAPI.convert({
        fileId: fileId.value,
        ...options
      });

      result.value = response;
      conversionProgress.value = 100;
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      converting.value = false;
    }
  }

  async function convertAsync(options: any) {
    if (!fileId.value) return;

    converting.value = true;
    conversionProgress.value = 0;
    error.value = null;
    result.value = null;

    try {
      const response = await ffmpegAPI.convertAsync({
        fileId: fileId.value,
        ...options
      });

      jobId.value = response.jobId;

      // Suivre la progression
      await pollJobStatus(response.jobId);

      return result.value;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      converting.value = false;
    }
  }

  async function pollJobStatus(id: string) {
    const poll = async () => {
      try {
        const status = await ffmpegAPI.getJobStatus(id);
        conversionProgress.value = status.progress;

        if (status.state === 'completed') {
          result.value = status.result;
          return;
        } else if (status.state === 'failed') {
          throw new Error('Conversion échouée');
        } else {
          // Continuer à suivre
          setTimeout(poll, 1000);
        }
      } catch (err: any) {
        error.value = err.message;
      }
    };

    await poll();
  }

  function reset() {
    currentFile.value = null;
    fileId.value = null;
    metadata.value = null;
    uploading.value = false;
    uploadProgress.value = 0;
    converting.value = false;
    conversionProgress.value = 0;
    error.value = null;
    result.value = null;
    jobId.value = null;
  }

  return {
    currentFile,
    fileId,
    metadata,
    uploading,
    uploadProgress,
    converting,
    conversionProgress,
    error,
    result,
    jobId,
    uploadFile,
    loadMetadata,
    convert,
    convertAsync,
    reset
  };
});
