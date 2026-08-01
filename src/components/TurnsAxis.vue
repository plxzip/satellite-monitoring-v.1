<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  zoom: number
  offset: number
}

const props = defineProps<Props>()

const TURN_DURATION_MINUTES = 96
const TOTAL_TURNS = 15

const preparedTurns = computed(() => {
  const turns = []
  for (let i = 0; i < TOTAL_TURNS; i++) {
    const startMin = i * TURN_DURATION_MINUTES
    turns.push({
      number: i + 1,
      style: {
        left: `${startMin * props.zoom}px`,
        width: `${TURN_DURATION_MINUTES * props.zoom}px`,
      },
    })
  }
  return turns
})
</script>

<template>
  <div class="turns-axis-container">
    <div
      class="turns-axis-scrollable"
      :style="{
        width: `${1440 * zoom}px`,
        transform: `translateX(${offset}px)`,
      }"
    >
      <div v-for="turn in preparedTurns" :key="turn.number" class="turn-cell" :style="turn.style">
        Виток №{{ turn.number }}
        <!-- выборка витка, повесть обработку -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.turns-axis-container {
  width: 100%;
  overflow: hidden;
  position: relative;
  height: 35px;
  background-color: var(--axis-bg, #1a1a1a);
}

.turns-axis-scrollable {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  will-change: transform, width;
}

.turn-cell {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #010101;
  border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  white-space: nowrap;
  will-change: left, width;
  box-sizing: border-box;
}

.turn-cell:nth-child(odd) {
  background-color: #d1d9e6;
}

.turn-cell:nth-child(even) {
  background-color: #e3eaf3;
}
</style>
