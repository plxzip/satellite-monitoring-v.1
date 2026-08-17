<script setup lang="ts">
import { computed } from 'vue'
import type { WorkInterval } from '../types/api'
import { parseTimeToMinutes } from '../utils/time'

interface Props {
  spacecraftId: number
  intervals: WorkInterval[]
  color: string
  zoom: number
  offset: number
}

const props = defineProps<Props>()

const preparedIntervals = computed(() => {
  return props.intervals.map((interval) => {
    const startMin = parseTimeToMinutes(interval.time_beg)
    const endMin = parseTimeToMinutes(interval.time_end)
    const duration = endMin - startMin

    return {
      id: interval.id,
      description: interval.description || '',
      style: {
        left: `${startMin * props.zoom + props.offset}px`,
        width: `${duration * props.zoom}px`,
        backgroundColor: props.color,
      },
    }
  })
})
</script>

<template>
  <div class="satellite-track">
    <div
      v-for="item in preparedIntervals"
      :key="item.id"
      class="timeline-bar"
      :style="item.style"
      :title="item.description"
    >
      <span class="bar-label">{{ item.description }}</span>
    </div>
  </div>
</template>

<style scoped>
.satellite-track {
  height: 35px;
  position: relative;
  border-bottom: 1px solid var(--sub-border-color);
  width: 100%;
  background-image: linear-gradient(to right, var(--border-color) 1px, transparent 1px);
  background-size: 60px 100%;
}

.timeline-bar {
  position: absolute;
  top: 6px;
  height: 22px;
  border-radius: 4px;
  color: white;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  user-select: none;
}

.bar-label {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}
</style>
