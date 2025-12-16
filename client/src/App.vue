<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
        <a class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white" href="/">
          ConvertFlow
        </a>
        <nav class="flex items-center gap-4">
          <router-link to="/" class="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded transition-colors">
            Accueil
          </router-link>
          <a href="https://github.com/frankkubler/convertflow-app" target="_blank" class="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded transition-colors">
            GitHub
          </a>
        </nav>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="max-w-5xl mx-auto p-4">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="w-full border-t border-gray-200 dark:border-gray-800 py-6 mt-16 text-center text-gray-500 text-sm bg-white/80 dark:bg-gray-900/80">
      <div class="max-w-5xl mx-auto">
        <span class="font-semibold text-gray-700 dark:text-gray-200">ConvertFlow v2.0</span> &mdash; Conversion média professionnelle avec FFmpeg
      </div>
    </footer>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
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

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--b2));
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--p));
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--pf));
}
</style>
