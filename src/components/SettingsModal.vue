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

const localSettings = ref<UserSettings>(JSON.parse(JSON.stringify(props.settings)))

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      localSettings.value = JSON.parse(JSON.stringify(props.settings))
    }
  },
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
        <h3>Настройки</h3>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div class="tabs">
        <button
          :class="{ active: activeTab === 'filter' }"
          @click="activeTab = 'filter'"
          type="button"
        >
          <img :src="filterIcon" class="tab-icon" />
          Фильтр
        </button>
        <button
          :class="{ active: activeTab === 'colors' }"
          @click="activeTab = 'colors'"
          type="button"
        >
          <img :src="paletteIcon" class="tab-icon" />
          Цвета
        </button>
      </div>

      <div v-if="activeTab === 'filter'" class="tab-body">
        <table class="settings-table">
          <thead>
            <tr>
              <th>Тип работы</th>
              <th>Все</th>
              <th v-for="sat in spacecrafts" :key="sat.id">{{ sat.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="work in workTypes" :key="work.id">
              <td class="work-name-td">{{ work.name }}</td>
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

      <div v-if="activeTab === 'colors'" class="tab-body">
        <div class="colors-list">
          <div v-for="work in workTypes" :key="work.id" class="color-picker-row">
            <span class="work-color-label">{{ work.name }}</span>
            <div class="picker-wrapper" v-if="localSettings[work.id]">
              <input type="color" v-model="localSettings[work.id]!.color" class="color-input" />
              <span class="color-hex-code">{{ localSettings[work.id]!.color.toUpperCase() }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="emit('close')">Отмена</button>
        <button class="btn-save" @click="handleSave">Применить</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #888;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.tab-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
  flex-shrink: 0;
  filter: var(--icon-filter);
}

.tabs button img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

@media (prefers-color-scheme: dark) {
  .tab-icon {
    filter: brightness(10);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background-color: var(--panel-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  width: 650px;
  max-height: 85vh;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 25px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
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
}

.close-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 26px;
  cursor: pointer;
  line-height: 1;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.tabs button {
  background: none;
  border: none;
  color: #888;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.tabs button.active {
  color: var(--text-color);
  border-bottom: 3px solid var(--turn-text);
}

.tab-body {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 5px;
}

.settings-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 13px;
}

.settings-table th,
.settings-table td {
  padding: 10px;
  border-bottom: 1px solid var(--sub-border-color);
}

.settings-table th {
  background-color: var(--axis-bg);
  font-weight: 600;
}

.work-name-td {
  text-align: left;
  font-weight: 500;
  width: 50%;
}

.colors-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-picker-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--axis-bg);
  border-radius: 4px;
}

.work-color-label {
  font-size: 13px;
  font-weight: 500;
}

.picker-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-input {
  width: 35px;
  height: 30px;
  border: none;
  cursor: pointer;
  background: none;
  padding: 0;
}

.color-hex-code {
  font-family: monospace;
  font-size: 12px;
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
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.btn-save:hover {
  background-color: #218838;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: #5a6268;
}

.settings-table input[type='checkbox'] {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: var(--checkbox-color, #3498db);
}
</style>
