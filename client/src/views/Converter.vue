<template>
  <div class="max-w-6xl mx-auto">
    <h1 class="text-4xl font-bold mb-8 text-white text-center">🔄 Convertisseur</h1>

    <div class="grid grid-cols-1 gap-6">
      <FileUploader @uploaded="handleFileUploaded" />
      
      <MetadataDisplay v-if="metadata" :metadata="metadata" />
      
      <ConversionPanel v-if="metadata" :metadata="metadata" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useConversionStore } from '@/stores/conversion.store';
import { storeToRefs } from 'pinia';
import FileUploader from '@/components/FileUploader.vue';
import MetadataDisplay from '@/components/MetadataDisplay.vue';
import ConversionPanel from '@/components/ConversionPanel.vue';

const conversionStore = useConversionStore();
const { metadata } = storeToRefs(conversionStore);

function handleFileUploaded() {
  console.log('Fichier uploadé avec succès');
}
</script>
