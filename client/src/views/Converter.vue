<template>
  <div class="space-y-6">
    <!-- Hero Section avec gradient -->
    <div class="hero min-h-[250px] bg-gradient-to-r from-primary via-primary to-secondary rounded-3xl shadow-2xl overflow-hidden relative">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="hero-content text-center text-primary-content relative z-10">
        <div class="max-w-2xl">
          <h1 class="text-6xl font-bold mb-4 animate-float drop-shadow-lg">🔄</h1>
          <h2 class="text-4xl font-bold mb-4">Convertisseur FFmpeg</h2>
          <p class="text-lg opacity-90 mb-6">
            Support universel de tous les codecs vidéo et audio
          </p>
          <div class="flex gap-2 justify-center flex-wrap">
            <div class="badge badge-lg bg-white/20 border-white/30">✅ H.264</div>
            <div class="badge badge-lg bg-white/20 border-white/30">✅ H.265/HEVC</div>
            <div class="badge badge-lg bg-white/20 border-white/30">✅ ProRes</div>
            <div class="badge badge-lg bg-white/20 border-white/30">✅ AV1</div>
            <div class="badge badge-lg bg-white/20 border-white/30">✅ VP9</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Section avec animation -->
    <div class="transform transition-all duration-300 hover:scale-[1.01]">
      <FileUploader @uploaded="handleFileUploaded" />
    </div>

    <!-- Metadata Section -->
    <transition name="slide-up">
      <div v-if="metadata" class="transform transition-all duration-300 hover:scale-[1.005]">
        <MetadataDisplay :metadata="metadata" />
      </div>
    </transition>

    <!-- Conversion Panel -->
    <transition name="slide-up" mode="out-in">
      <div v-if="metadata" class="transform transition-all duration-300 hover:scale-[1.005]">
        <ConversionPanel :metadata="metadata" />
      </div>
    </transition>

    <!-- Stats Cards (affichées quand pas de fichier) -->
    <div v-if="!metadata" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="stat bg-gradient-to-br from-base-100 to-base-200 rounded-2xl shadow-xl border border-base-300 hover:border-primary hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div class="stat-figure text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-10 h-10 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>
          </svg>
        </div>
        <div class="stat-title text-base-content/70">Formats supportés</div>
        <div class="stat-value text-primary text-4xl">100+</div>
        <div class="stat-desc text-base-content/60">Vidéo, Audio, Conteneurs</div>
      </div>
      
      <div class="stat bg-gradient-to-br from-base-100 to-base-200 rounded-2xl shadow-xl border border-base-300 hover:border-secondary hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div class="stat-figure text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-10 h-10 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
        </div>
        <div class="stat-title text-base-content/70">Codecs</div>
        <div class="stat-value text-secondary text-4xl">Tous</div>
        <div class="stat-desc text-base-content/60">Aucune limitation</div>
      </div>
      
      <div class="stat bg-gradient-to-br from-base-100 to-base-200 rounded-2xl shadow-xl border border-base-300 hover:border-accent hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div class="stat-figure text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-10 h-10 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <div class="stat-title text-base-content/70">Performance</div>
        <div class="stat-value text-accent text-4xl">Rapide</div>
        <div class="stat-desc text-base-content/60">Progression temps réel</div>
      </div>
    </div>

    <!-- Guide rapide -->
    <div v-if="!metadata" class="card bg-gradient-to-br from-info/10 to-info/5 border border-info/20 shadow-xl">
      <div class="card-body">
        <h3 class="card-title text-info">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Comment ça marche ?
        </h3>
        <div class="grid md:grid-cols-3 gap-4 mt-4">
          <div class="flex gap-3">
            <div class="badge badge-lg badge-primary">1</div>
            <div>
              <h4 class="font-bold mb-1">Upload</h4>
              <p class="text-sm text-base-content/70">Glissez-déposez votre fichier ou cliquez pour sélectionner</p>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="badge badge-lg badge-secondary">2</div>
            <div>
              <h4 class="font-bold mb-1">Configuration</h4>
              <p class="text-sm text-base-content/70">Choisissez le format de sortie et les options</p>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="badge badge-lg badge-accent">3</div>
            <div>
              <h4 class="font-bold mb-1">Téléchargement</h4>
              <p class="text-sm text-base-content/70">Récupérez votre fichier converti</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
