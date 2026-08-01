<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  zoom: number
  offset: number
}

const props = defineProps<Props>()

const STEP_OPTIONS = [1, 3, 6, 12, 24, 48, 96, 288, 480]

const chosenStep = computed(() => {
  return STEP_OPTIONS.find((step) => step * props.zoom >= 95) || 480
})

const preparedMarks = computed(() => {
  const marks = []
  const step = chosenStep.value

  for (let minutes = 0; minutes <= 1440; minutes += step) {
    const totalHours = Math.floor(minutes / 60)
    const mins = minutes % 60

    const displayHours = totalHours === 24 ? '00' : String(totalHours).padStart(2, '0')
    const displayMins = String(mins).padStart(2, '0')
    const label = `${displayHours}:${displayMins}:00`

    marks.push({
      label,
      minutes,
      style: {
        left: `${minutes * props.zoom}px`,
      },
    })
  }
  return marks
})
</script>

<template>
  <div class="time-axis-container">
    <div
      class="time-axis-scrollable"
      :style="{
        width: `${1440 * zoom}px`,
        transform: `translateX(${offset}px)`,
      }"
    >
      <div v-for="mark in preparedMarks" :key="mark.minutes" class="time-mark" :style="mark.style">
        <div class="tick-line"></div>
        <span class="tick-label">{{ mark.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.time-axis-container {
  width: 100%;
  overflow: hidden;
  position: relative;
  height: 40px;
  background-color: var(--panel-bg, #1a1a1a);
}

.time-axis-scrollable {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  will-change: transform, width;
}

.time-mark {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
  will-change: left;
}

.tick-line {
  width: 1px;
  height: 8px;
  background-color: var(--border-color, rgba(255, 255, 255, 0.2));
}

.tick-label {
  font-size: 11px;
  color: var(--text-color, #ffffff);
  margin-top: 4px;
  font-family: monospace;
}
</style>
