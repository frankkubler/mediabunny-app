<template>
  <nav class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-md">
    <div class="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
      <router-link to="/" class="app-title text-2xl font-extrabold tracking-tight">
        ConvertFlow
      </router-link>
      <div class="flex items-center gap-2">
        <ul class="flex items-center gap-6 font-medium">
          <li><router-link to="/" class="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded transition-colors">Accueil</router-link></li>
          <li><router-link to="/converter" class="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded transition-colors">Convertir</router-link></li>
          <li><router-link to="/history" class="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded transition-colors">Historique</router-link></li>
        </ul>
        <ThemeToggle />
      </div>
    </div>
  </nav>
<script setup>
import ThemeToggle from './ThemeToggle.vue';
</script>
</template>
