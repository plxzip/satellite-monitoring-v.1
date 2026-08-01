<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useTheme } from './composables/useTheme'

useTheme()
</script>

<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<style>
@import './assets/styles/themes.css';

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: 'Segoe UI';
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}

.app-container {
  min-height: 100vh;
  padding: 15px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
</style>
