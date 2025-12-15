<template>
  <div class="max-w-6xl mx-auto">
    <h1 class="text-4xl font-bold mb-8 text-white text-center">📜 Historique</h1>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">Fichiers uploadés</h2>
        
        <div v-if="mediaStore.loading" class="text-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        
        <div v-else-if="mediaStore.files.length === 0" class="text-center py-8 text-base-content/50">
          Aucun fichier pour le moment
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Taille</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="file in mediaStore.files" :key="file.id">
                <td>{{ file.filename }}</td>
                <td>{{ formatFileSize(file.size) }}</td>
                <td>{{ file.createdAt ? formatDate(file.createdAt) : 'N/A' }}</td>
                <td>
                  <button 
                    @click="deleteFile(file.id)" 
                    class="btn btn-error btn-sm"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl mt-6">
      <div class="card-body">
        <h2 class="card-title mb-4">Conversions récentes</h2>
        
        <div v-if="conversionStore.history.length === 0" class="text-center py-8 text-base-content/50">
          Aucune conversion pour le moment
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="(item, index) in conversionStore.history" 
            :key="index"
            class="flex items-center justify-between p-4 bg-base-200 rounded-lg"
          >
            <div>
              <p class="font-medium">{{ item.filename }}</p>
              <p class="text-sm text-base-content/70">ID: {{ item.outputId }}</p>
            </div>
            <a :href="item.outputPath" download class="btn btn-primary btn-sm">
              Télécharger
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useMediaStore } from '@/stores/media.store';
import { useConversionStore } from '@/stores/conversion.store';

const mediaStore = useMediaStore();
const conversionStore = useConversionStore();

onMounted(() => {
  mediaStore.listFiles();
});

async function deleteFile(fileId: string) {
  if (confirm('Voulez-vous vraiment supprimer ce fichier ?')) {
    await mediaStore.deleteFile(fileId);
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('fr-FR');
}
</script>
