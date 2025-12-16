<template>
  <button
    class="ml-4 p-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow hover:shadow-md transition"
    :aria-label="isDark ? 'Activer le mode clair' : 'Activer le mode sombre'"
    @click="toggleTheme"
  >
    <span v-if="isDark">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isDark = ref(false);

function setTheme(dark: boolean) {
  isDark.value = dark;
  const html = document.documentElement;
  if (dark) {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}

function toggleTheme() {
  setTheme(!isDark.value);
}

onMounted(() => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') setTheme(true);
  else if (saved === 'light') setTheme(false);
  else setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
});
</script>
