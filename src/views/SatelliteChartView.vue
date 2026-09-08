<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'

import TheHeader from '../components/TheHeader.vue'
import TurnsAxis from '../components/TurnsAxis.vue'
import ChartGrid from '../components/ChartGrid.vue'
import ChartRow from '../components/ChartRow.vue'
import TimeAxis from '../components/TimeAxis.vue'
import SettingsModal from '../components/SettingsModal.vue'

import type { Spacecraft, WorkType, WorkInterval, DefaultColor } from '../types/api'
import type { UserSettings } from '../types/ui'

const router = useRouter()
const { isDark, toggleTheme } = useTheme()

const ganttBoardRef = ref<HTMLElement | null>(null)
const boardWidth = ref<number>(1200)

const zoom = ref<number>(1.0)
const offset = ref<number>(0)
const isDragging = ref<boolean>(false)
const startX = ref<number>(0)
const isSettingsOpen = ref<boolean>(false)

const isLoading = ref<boolean>(true)

const MOCK_SPACECRAFTS: Spacecraft[] = [
  { id: 1, name: 'БВР-1' },
  { id: 2, name: 'БВР-2' },
]

const MOCK_WORK_TYPES: WorkType[] = [
  { id: 1, name: 'Передача ЦИ' },
  { id: 2, name: 'Съемка' },
  { id: 3, name: 'Проведение технологических режимов' },
  { id: 4, name: 'Проведение сеанса управления' },
  { id: 5, name: 'Проведение маневра' },
  { id: 6, name: 'Запрет ЦР' },
  { id: 7, name: 'Запрет передачи ЦИ' },
  { id: 8, name: 'Запрет целевых работ' },
  { id: 9, name: 'Засечка на ВКИ' },
  { id: 10, name: 'Интервалы зон радиовидимости' },
  { id: 11, name: 'Интервалы теней' },
  { id: 12, name: 'Интервалы возможной съемки' },
]

const MOCK_COLORS: DefaultColor[] = [
  { id: 1, type_id: 1, color: '#3498db' },
  { id: 2, type_id: 2, color: '#2ecc71' },
  { id: 3, type_id: 3, color: '#3f51b5' },
  { id: 4, type_id: 4, color: '#e91e63' },
  { id: 5, type_id: 5, color: '#e67e22' },
  { id: 6, type_id: 6, color: '#111111' },
  { id: 7, type_id: 7, color: '#7f8c8d' },
  { id: 8, type_id: 8, color: '#1abc9c' },
  { id: 9, type_id: 9, color: '#9b59b6' },
  { id: 10, type_id: 10, color: '#bdc3c7' },
  { id: 11, type_id: 11, color: '#95a5a6' },
  { id: 12, type_id: 12, color: '#27ae60' },
]

const MOCK_INTERVALS: WorkInterval[] = [
  {
    id: 101,
    type_id: 3,
    spacecraft_id: 1,
    time_beg: '2026-06-30 09:00:00',
    time_end: '2026-06-30 10:30:00',
  },
  {
    id: 102,
    type_id: 4,
    spacecraft_id: 1,
    time_beg: '2026-06-30 04:15:00',
    time_end: '2026-06-30 04:30:00',
  },
  {
    id: 103,
    type_id: 5,
    spacecraft_id: 1,
    time_beg: '2026-06-30 01:30:00',
    time_end: '2026-06-30 02:45:00',
  },
  {
    id: 104,
    type_id: 5,
    spacecraft_id: 2,
    time_beg: '2026-06-30 15:00:00',
    time_end: '2026-06-30 20:00:00',
  },
  {
    id: 105,
    type_id: 6,
    spacecraft_id: 1,
    time_beg: '2026-06-30 10:00:00',
    time_end: '2026-06-30 14:00:00',
  },
  {
    id: 106,
    type_id: 8,
    spacecraft_id: 1,
    time_beg: '2026-06-30 02:00:00',
    time_end: '2026-06-30 04:30:00',
  },
  {
    id: 107,
    type_id: 8,
    spacecraft_id: 1,
    time_beg: '2026-06-30 12:00:00',
    time_end: '2026-06-30 22:30:00',
  },
  {
    id: 108,
    type_id: 9,
    spacecraft_id: 1,
    time_beg: '2026-06-30 22:45:00',
    time_end: '2026-06-30 23:15:00',
  },
  {
    id: 109,
    type_id: 12,
    spacecraft_id: 1,
    time_beg: '2026-06-30 15:00:00',
    time_end: '2026-06-30 15:45:00',
  },
  {
    id: 110,
    type_id: 12,
    spacecraft_id: 1,
    time_beg: '2026-06-30 16:30:00',
    time_end: '2026-06-30 17:15:00',
  },
  {
    id: 111,
    type_id: 12,
    spacecraft_id: 1,
    time_beg: '2026-06-30 18:00:00',
    time_end: '2026-06-30 18:45:00',
  },
]

const minZoom = computed(() => {
  const visibleTimelineWidth = boardWidth.value - 320
  return visibleTimelineWidth > 0 ? visibleTimelineWidth / 1440 : 0.5
})

const clampTimelineBounds = () => {
  const visibleTimelineWidth = boardWidth.value - 320
  const totalChartWidth = 1440 * zoom.value

  let targetZoom = zoom.value
  let targetOffset = offset.value

  if (targetZoom < minZoom.value) {
    targetZoom = minZoom.value
    targetOffset = 0
  } else {
    if (targetOffset > 0) targetOffset = 0
    const maxLeftOffset = visibleTimelineWidth - totalChartWidth
    if (targetOffset < maxLeftOffset) targetOffset = maxLeftOffset
  }

  if (zoom.value !== targetZoom) zoom.value = targetZoom
  if (offset.value !== targetOffset) offset.value = targetOffset
}

watch(minZoom, (newMinZoom) => {
  if (isLoading.value) return

  if (zoom.value < newMinZoom) {
    zoom.value = newMinZoom
    offset.value = 0
  } else {
    clampTimelineBounds()
  }
})

watch([zoom, offset], () => {
  clampTimelineBounds()
})

let resizeObserver: ResizeObserver | null = null

const currentUser = ref<string>('Всеволод')
const currentDate = ref<string>('2026-06-30')

const spacecrafts = ref<Spacecraft[]>([])
const workTypes = ref<WorkType[]>([])
const defaultColors = ref<DefaultColor[]>([])
const intervals = ref<WorkInterval[]>([])
const settings = ref<UserSettings>({})

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
})

async function getColors() {
  try {
    const response = await fetch('api/colors/', { method: 'GET', headers: getAuthHeaders() })
    if (!response.ok) throw new Error()
    const data = await response.json()
    defaultColors.value = data.colors
  } catch {
    defaultColors.value = MOCK_COLORS
  }
}

async function getTypes() {
  try {
    const response = await fetch('api/types/', { method: 'GET', headers: getAuthHeaders() })
    if (!response.ok) throw new Error()
    const data = await response.json()
    workTypes.value = data.types
  } catch {
    workTypes.value = MOCK_WORK_TYPES
  }
}

async function getSpacecrafts() {
  try {
    const response = await fetch('api/spacecrafts/', { method: 'GET', headers: getAuthHeaders() })
    if (!response.ok) throw new Error()
    const data = await response.json()
    spacecrafts.value = data.spacecrafts
  } catch {
    spacecrafts.value = MOCK_SPACECRAFTS
  }
}

async function getIntervals(date: string) {
  try {
    const response = await fetch(`/api/works/${date}`, { method: 'GET', headers: getAuthHeaders() })
    if (!response.ok) throw new Error()
    const data = await response.json()
    intervals.value = data.works
  } catch {
    intervals.value = MOCK_INTERVALS
  }
}

const initSettings = () => {
  let savedSettings: UserSettings = {}
  
  const saved = localStorage.getItem('satellite_chart_user_settings')
  if (saved) {
    try {
      savedSettings = JSON.parse(saved)
    } catch (e) {
      console.error('Ошибка чтения настроек из localStorage', e)
    }
  }

  const mergedSettings: UserSettings = {}

  workTypes.value.forEach((work) => {
    const savedWorkSetting = savedSettings[work.id]
    const colorObj = defaultColors.value.find((c) => c.type_id === work.id)
    const fallbackColor = colorObj ? colorObj.color : '#cccccc'

    const satelliteVisibility: Record<number, boolean> = {}
    spacecrafts.value.forEach((sat) => {
      const savedSatVis = savedWorkSetting?.visible?.satellites?.[sat.id]
      satelliteVisibility[sat.id] = savedSatVis !== undefined ? savedSatVis : true
    })

    mergedSettings[work.id] = {
      visible: {
        all: savedWorkSetting?.visible?.all !== undefined ? savedWorkSetting.visible.all : true,
        satellites: satelliteVisibility,
      },
      color: savedWorkSetting?.color || fallbackColor,
    }
  })

  settings.value = mergedSettings
}

watch(
  settings,
  (newSettings) => {
    if (!isLoading.value && Object.keys(newSettings).length > 0) {
      localStorage.setItem('satellite_chart_user_settings', JSON.stringify(newSettings))
    }
  },
  { deep: true },
)

const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  if (!ganttBoardRef.value) return

  const rect = ganttBoardRef.value.getBoundingClientRect()
  const mouseXInTimeline = e.clientX - rect.left - 240

  const oldZoom = zoom.value
  const zoomFactor = 1.15
  const newZoom =
    e.deltaY < 0
      ? Math.min(oldZoom * zoomFactor, 100)
      : Math.max(oldZoom / zoomFactor, minZoom.value)

  if (newZoom === oldZoom) return

  const mouseTimeMinutes = (mouseXInTimeline - offset.value) / oldZoom
  const visibleTimelineWidth = boardWidth.value - 320
  const totalChartWidth = 1440 * newZoom
  const maxLeftOffset = visibleTimelineWidth - totalChartWidth

  let newOffset = mouseXInTimeline - mouseTimeMinutes * newZoom
  if (newOffset > 0) newOffset = 0
  if (newOffset < maxLeftOffset) newOffset = maxLeftOffset

  zoom.value = newZoom
  offset.value = newOffset
}

const handleMouseDown = (e: MouseEvent) => {
  if (
    (e.target as HTMLElement).closest('.timeline-bar') ||
    (e.target as HTMLElement).closest('.row-label') ||
    (e.target as HTMLElement).closest('.right-track-label')
  )
    return
  isDragging.value = true
  startX.value = e.clientX - offset.value
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  offset.value = e.clientX - startX.value
}

const handleMouseUpOrLeave = () => {
  isDragging.value = false
}

const handleDateChange = async (newDate: string) => {
  currentDate.value = newDate
  isLoading.value = true

  offset.value = 0

  try {
    await Promise.all([getTypes(), getSpacecrafts(), getIntervals(newDate)])
    initSettings()

    await nextTick()
    if (ganttBoardRef.value) {
      boardWidth.value = ganttBoardRef.value.getBoundingClientRect().width
    }
    zoom.value = minZoom.value
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('access_token')
  router.push('/')
}

const updateSettings = (updated: UserSettings) => {
  settings.value = updated
}

onMounted(async () => {
  try {
    await Promise.all([getTypes(), getColors(), getSpacecrafts(), getIntervals(currentDate.value)])
    initSettings()
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }

  await nextTick()
  if (ganttBoardRef.value) {
    boardWidth.value = ganttBoardRef.value.getBoundingClientRect().width

    zoom.value = minZoom.value
    offset.value = 0

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        boardWidth.value = entry.contentRect.width
      }
    })
    resizeObserver.observe(ganttBoardRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<template>
  <div class="view-container">
    <TheHeader
      :is-dark="isDark"
      :current-user="currentUser"
      :current-date="currentDate"
      @toggle-theme="toggleTheme"
      @open-settings="isSettingsOpen = true"
      @change-date="handleDateChange"
      @logout="handleLogout"
    />

    <div
      ref="ganttBoardRef"
      class="gantt-board"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUpOrLeave"
      @mouseleave="handleMouseUpOrLeave"
      :class="{ dragging: isDragging, 'board-loading': isLoading }"
    >
      <div v-if="isLoading" class="gantt-loading-overlay">
        <div class="spinner"></div>
        <span>Синхронизация данных с сервером...</span>
      </div>

      <div class="gantt-sticky-header" @wheel.stop>
        <div class="gantt-label-stub"></div>
        <div class="gantt-timeline-axis-wrapper">
          <TurnsAxis :zoom="zoom" :offset="offset" />
        </div>
        <div class="gantt-right-stub"></div>
      </div>

      <div class="gantt-rows-container" @wheel="handleWheel">
        <ChartGrid :zoom="zoom" :offset="offset" />

        <ChartRow
          v-for="work in workTypes"
          :key="work.id"
          :work-type="work"
          :spacecrafts="spacecrafts"
          :intervals="intervals"
          :settings="settings"
          :zoom="zoom"
          :offset="offset"
        />
      </div>

      <div class="gantt-sticky-footer" @wheel.stop>
        <div class="gantt-label-stub"></div>
        <div class="gantt-timeline-axis-wrapper">
          <TimeAxis :zoom="zoom" :offset="offset" />
        </div>
        <div class="gantt-right-stub"></div>
      </div>
    </div>

    <SettingsModal
      v-if="Object.keys(settings).length > 0"
      :is-open="isSettingsOpen"
      :settings="settings"
      :work-types="workTypes"
      :spacecrafts="spacecrafts"
      @close="isSettingsOpen = false"
      @save="updateSettings"
    />
  </div>
</template>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh; /* Занимает всю страницу, но может бесконечно расти вниз */
  box-sizing: border-box;
}

.gantt-board {
  display: flex;
  flex-direction: column;
  background-color: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: grab;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin: 0 12px 12px 12px; /* Небольшие отступы по краям доски */
  position: relative;
}

.gantt-board.dragging {
  cursor: grabbing;
}

/* ОСИ ТЕПЕРЬ ЛИПНУТ К ЭКРАНУ ПРИ СКРОЛЛЕ СТРАНИЦЫ */
.gantt-sticky-header {
  position: sticky;
  top: 0; /* Прижимается к верху окна */
  display: grid;
  grid-template-columns: 240px 1fr 80px;
  align-items: stretch;
  width: 100%;
  z-index: 20; /* Повыше, чтобы перекрывать плашки */
  background-color: var(--panel-bg);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.gantt-sticky-footer {
  position: sticky;
  bottom: 0; /* Прижимается к низу окна */
  display: grid;
  grid-template-columns: 240px 1fr 80px;
  align-items: stretch;
  width: 100%;
  z-index: 20;
  background-color: var(--panel-bg);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.gantt-label-stub {
  background-color: var(--panel-bg);
  border-right: 1px solid var(--border-color);
}

.gantt-right-stub {
  background-color: var(--panel-bg);
  border-left: 1px solid var(--border-color);
}

.gantt-timeline-axis-wrapper {
  overflow: hidden;
  position: relative;
  background-color: transparent;
}

/* Основной контейнер задач — теперь он просто растягивается по высоте */
.gantt-rows-container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: transparent;
}

.gantt-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  min-height: 400px;
  color: var(--text-color);
  font-size: 14px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-color);
  border-top-color: #2980b9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.gantt-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(26, 26, 26, 0.7); /* Полупрозрачный фон под цвет панели */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  z-index: 100; /* Выше осей и строк */
  border-radius: 8px;
  color: var(--text-color);
  font-size: 14px;
}

.gantt-sticky-header,
.gantt-sticky-footer,
:deep(.row-label),
:deep(.row-stub-right) {
  cursor: default;
}
</style>
