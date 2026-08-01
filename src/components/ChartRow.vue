<script setup lang="ts">
import { computed } from 'vue'
import type { WorkType, Spacecraft, WorkInterval } from '../types/api'
import type { UserSettings } from '../types/ui'

interface Props {
  workType: WorkType
  spacecrafts: Spacecraft[]
  intervals: WorkInterval[]
  settings: UserSettings
  zoom: number
  offset: number
}

const props = defineProps<Props>()

defineEmits(['gantt-wheel'])

const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0
  const cleanTime = timeStr.trim().slice(-8)

  const parts = cleanTime.split(':')
  const hours = parseInt(parts[0] || '0', 10)
  const minutes = parseInt(parts[1] || '0', 10)
  const seconds = parseInt(parts[2] || '0', 10)

  if (isNaN(hours) || isNaN(minutes)) {
    console.error(`Критическая ошибка парсинга времени для строки: "${timeStr}"`)
    return 0
  }

  return hours * 60 + minutes + seconds / 60
}

const filteredIntervalsForRow = computed(() => {
  const rowSetting = props.settings[props.workType.id]

  if (!rowSetting || !rowSetting.visible.all) return []

  return props.intervals
    .filter((item) => {
      if (item.type_id !== props.workType.id) return false
      const satVisibility = rowSetting.visible.satellites[item.spacecraft_id]
      return satVisibility !== false
    })
    .map((item) => {
      const startMin = parseTimeToMinutes(item.time_beg)
      const endMin = parseTimeToMinutes(item.time_end)
      return {
        id: item.id,
        spacecraft_id: item.spacecraft_id,
        description: item.description || props.workType.name,
        startMin,
        duration: endMin - startMin,
      }
    })
})

const rowColor = computed(() => {
  return props.settings[props.workType.id]?.color || '#cccccc'
})

const getBarStyles = (startMin: number, duration: number) => {
  return {
    left: `${startMin * props.zoom + props.offset}px`,
    width: `${duration * props.zoom}px`,
    backgroundColor: rowColor.value,
  }
}

const getIntervalsForSatellite = (satelliteId: number) => {
  return filteredIntervalsForRow.value.filter((item) => item.spacecraft_id === satelliteId)
}
</script>

<template>
  <div class="chart-row">
    <div class="row-label" @wheel.stop>
      {{ workType.name }}
    </div>

    <div class="row-timeline-wrapper" @wheel="$emit('gantt-wheel', $event)">
      <div v-for="sat in spacecrafts" :key="sat.id" class="satellite-track">
        <div
          v-for="interval in getIntervalsForSatellite(sat.id)"
          :key="interval.id"
          class="timeline-bar"
          :style="getBarStyles(interval.startMin, interval.duration)"
          :title="`${sat.name}: ${interval.description}`"
        >
          <span class="bar-title">
            {{ interval.description }}
          </span>
        </div>
      </div>
    </div>

    <div class="row-stub-right" @wheel.stop>
      <div v-for="sat in spacecrafts" :key="sat.id" class="right-track-label">
        {{ sat.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-row {
  display: grid;
  grid-template-columns: 240px 1fr 80px;
  align-items: stretch;
  border-bottom: 1px solid var(--border-color);
  background-color: transparent;
  position: relative;
  z-index: 1;
}

.row-label {
  padding: 0 14px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  background-color: var(--panel-bg);
  z-index: 3;
  user-select: none;
}

.row-timeline-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: transparent;
}

.satellite-track {
  position: relative;
  height: 38px;
  display: flex;
  align-items: center;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
}

.satellite-track:last-child {
  border-bottom: none;
}

.timeline-bar {
  position: absolute;
  z-index: 2;
  height: 26px;
  border-radius: 4px;
  padding: 2px 6px;
  color: white;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  will-change: left, width;
}

.bar-title {
  font-size: 10px;
  font-weight: 600;
  text-overflow: ellipsis;
  overflow: hidden;
}

.row-stub-right {
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--border-color);
  background-color: var(--panel-bg);
  z-index: 3;
}

.right-track-label {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-color);
  opacity: 0.8;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
}

.right-track-label:last-child {
  border-bottom: none;
}
</style>
