<template>
  <div class="min-h-screen gradient-bg text-gray-900 dark:text-gray-100">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-md">
      <div class="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
        <a class="text-3xl font-extrabold tracking-tight app-title" href="/">
          ConvertFlow
        </a>
        <nav class="flex items-center gap-4">
          <router-link to="/" class="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded transition-colors font-medium">
            Accueil
          </router-link>
          <a href="https://github.com/frankkubler/convertflow-app" target="_blank" class="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded transition-colors font-medium">
            GitHub
          </a>
        </nav>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="max-w-5xl mx-auto p-4">
      <div class="glass-card p-6 mt-8 animate-fadeInScale">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Footer -->
    <footer class="w-full border-t border-gray-200 dark:border-gray-800 py-6 mt-16 text-center text-gray-500 text-sm bg-white/70 dark:bg-gray-900/70 backdrop-blur-md">
      <div class="max-w-5xl mx-auto">
        <span class="font-semibold text-gray-700 dark:text-gray-200">ConvertFlow v2.0</span> &mdash; Conversion média professionnelle avec FFmpeg
      </div>
    </footer>
  </div>
</template>

<style>
/* Les animations et utilitaires sont dans style.css */
</style>
