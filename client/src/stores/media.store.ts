import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export interface MediaFile {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  mimetype: string;
  metadata?: any;
}

export const useMediaStore = defineStore('media', () => {
  const files = ref<MediaFile[]>([]);
  const currentFile = ref<MediaFile | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function uploadFile(file: File) {
    loading.value = true;
    error.value = null;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        currentFile.value = response.data.file;
        files.value.unshift(response.data.file);
        return response.data.file;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getMetadata(fileId: string) {
    try {
      const response = await api.get(`/media/metadata/${fileId}`);
      return response.data.metadata;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    }
  }

  async function deleteFile(fileId: string) {
    try {
      await api.delete(`/media/${fileId}`);
      files.value = files.value.filter(f => f.id !== fileId);
      if (currentFile.value?.id === fileId) {
        currentFile.value = null;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    }
  }

  async function listFiles() {
    loading.value = true;
    try {
      const response = await api.get('/media/list');
      files.value = response.data.files;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  }

  return {
    files,
    currentFile,
    loading,
    error,
    uploadFile,
    getMetadata,
    deleteFile,
    listFiles
  };
});
