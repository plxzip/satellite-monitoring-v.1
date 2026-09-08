<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Spacecraft, WorkType } from '../types/api'
import type { UserSettings } from '../types/ui'
import filterIcon from '../assets/filter.png'
import paletteIcon from '../assets/palette.png'

interface Props {
  isOpen: boolean
  settings: UserSettings
  workTypes: WorkType[]
  spacecrafts: Spacecraft[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [updatedSettings: UserSettings]
}>()

const activeTab = ref<'filter' | 'colors'>('filter')

const localSettings = ref<UserSettings>({})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      localSettings.value = JSON.parse(JSON.stringify(props.settings))
    }
  },
  { immediate: true },
)

const handleSave = () => {
  emit('save', JSON.parse(JSON.stringify(localSettings.value)))
  emit('close')
}
</script>
<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Настройки отображения</h3>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div class="tabs">
        <button
          :class="{ active: activeTab === 'filter' }"
          @click="activeTab = 'filter'"
          type="button"
        >
          <img :src="filterIcon" class="tab-icon" alt="" />
          Фильтр работ
        </button>
        <button
          :class="{ active: activeTab === 'colors' }"
          @click="activeTab = 'colors'"
          type="button"
        >
          <img :src="paletteIcon" class="tab-icon" alt="" />
          Цветовая схема
        </button>
      </div>

      <div v-show="activeTab === 'filter'" class="tab-body">
        <div class="table-wrapper">
          <table class="settings-table">
            <thead>
              <tr>
                <th class="sticky-col">Тип работы</th>
                <th>Все</th>
                <th v-for="sat in spacecrafts" :key="sat.id">{{ sat.name }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="work in workTypes" :key="work.id">
                <td class="work-name-td sticky-col">{{ work.name }}</td>
                <td>
                  <input
                    v-if="localSettings[work.id]"
                    type="checkbox"
                    v-model="localSettings[work.id]!.visible.all"
                  />
                </td>
                <td v-for="sat in spacecrafts" :key="sat.id">
                  <input
                    v-if="localSettings[work.id]"
                    type="checkbox"
                    v-model="localSettings[work.id]!.visible.satellites[sat.id]"
                    :disabled="!localSettings[work.id]!.visible.all"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-show="activeTab === 'colors'" class="tab-body">
        <div class="colors-grid">
          <div v-for="work in workTypes" :key="work.id" class="color-picker-card">
            <span class="work-color-label" :title="work.name">{{ work.name }}</span>
            <div class="picker-wrapper" v-if="localSettings[work.id]">
              <input type="color" v-model="localSettings[work.id]!.color" class="color-input" />
              <span class="color-hex-code">{{ localSettings[work.id]!.color.toUpperCase() }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="emit('close')">Отмена</button>
        <button class="btn-save" @click="handleSave">Сохранить и применить</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background-color: var(--panel-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 900px; /* Увеличили максимальную ширину */
  max-height: 85vh;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 24px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.tabs button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #888;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tabs button.active {
  color: var(--checkbox-color, #3498db);
  border-bottom-color: var(--checkbox-color, #3498db);
}

.tab-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  filter: var(--icon-filter);
}

.tab-body {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 16px;
}

/* Красивый кастомный скроллбар при необходимости */
.tab-body::-webkit-scrollbar {
  width: 6px;
}
.tab-body::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 3px;
}

/* ВКЛАДКА "ФИЛЬТР": Таблица */
.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--sub-border-color);
  border-radius: 6px;
}

.settings-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 13px;
}

.settings-table th,
.settings-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--sub-border-color);
  white-space: nowrap;
}

.settings-table th {
  background-color: var(--axis-bg);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 2;
}

.work-name-td {
  text-align: left;
  font-weight: 500;
}

.settings-table input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--checkbox-color, #3498db);
}

/* ВКЛАДКА "ЦВЕТА": Сетка (Grid) вместо вертикального списка */
.colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}

.color-picker-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--axis-bg);
  border-radius: 6px;
  border: 1px solid var(--sub-border-color);
}

.work-color-label {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.picker-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input {
  width: 30px;
  height: 26px;
  border: none;
  cursor: pointer;
  background: none;
  padding: 0;
}

.color-hex-code {
  font-family: monospace;
  font-size: 11px;
  color: #888;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border-color);
  padding-top: 15px;
}

.btn-save {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.btn-save:hover {
  background-color: #218838;
}

.btn-cancel {
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 9px 18px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: var(--axis-bg);
}
</style>