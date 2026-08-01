<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  zoom: number
  offset: number
}

const props = defineProps<Props>()

const STEP_OPTIONS = [1, 3, 6, 12, 24, 48, 96, 288, 480]

const majorStep = computed(() => {
  return STEP_OPTIONS.find((step) => step * props.zoom >= 95) || 480
})

const minorStep = computed(() => {
  return STEP_OPTIONS.find((step) => step * props.zoom >= 22) || 1
})

const gridLines = computed(() => {
  const lines = []
  const major = majorStep.value
  const minor = minorStep.value

  for (let minutes = 0; minutes <= 1440; minutes += minor) {
    lines.push({
      minutes,
      isMajor: minutes % major === 0,
      left: minutes * props.zoom + props.offset,
    })
  }
  return lines
})
</script>

<template>
  <div class="gantt-grid-overlay">
    <div
      v-for="line in gridLines"
      :key="line.minutes"
      class="grid-line"
      :class="{ 'major-line': line.isMajor, 'minor-line': !line.isMajor }"
      :style="{ left: `${line.left}px` }"
    ></div>
  </div>
</template>

<style scoped>
.gantt-grid-overlay {
  position: absolute;
  top: 0;
  left: 240px;
  right: 80px;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.grid-line {
  position: absolute;
  top: 0;
  height: 100%;
  width: 1px;
  will-change: left;
}

.major-line {
  border-left: 1px dashed var(--border-color);
  opacity: 0.3;
}

.minor-line {
  border-left: 1px solid var(--border-color);
  opacity: 0.1;
}
</style>
