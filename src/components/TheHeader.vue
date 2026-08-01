<script setup lang="ts">
import iconAdmin from '../assets/admin.png'
import iconDark from '../assets/dark-theme.png'
import iconLight from '../assets/light-theme.png'
import iconSettings from '../assets/settings.png'

defineProps<{
  isDark: boolean
  currentUser: string
  currentDate: string
}>()

const emit = defineEmits<{
  'toggle-theme': []
  'open-settings': []
  'change-date': [newDate: string]
  logout: []
}>()

const onDateChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target && target.value) {
    emit('change-date', target.value)
  }
}
</script>

<template>
  <header class="header">
    <div class="header-left">
      <div class="user-info" :title="`Вы вошли как ${currentUser}`">
        <img :src="iconAdmin" alt="Админ" class="btn-icon-img" />
        <span class="username-label">{{ currentUser }}</span>
      </div>

      <button class="icon-btn" @click="emit('toggle-theme')" title="Сменить тему">
        <img
          :src="isDark ? iconDark : iconLight"
          alt="Тема"
          class="btn-icon-img theme-toggle-icon"
        />
      </button>

      <button class="icon-btn" @click="emit('open-settings')" title="Настройки интерфейса">
        <img :src="iconSettings" alt="Настройки" class="btn-icon-img" />
      </button>
    </div>

    <div class="header-right">
      <div class="date-picker">
        <label for="calendar-input" class="date-label">Сутки:</label>
        <input
          type="date"
          id="calendar-input"
          :value="currentDate"
          @input="onDateChange"
          class="date-input"
        />
      </div>

      <button class="logout-btn" @click="emit('logout')" title="Выйти из системы">
        <span class="logout-icon">➔</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--panel-bg);
  padding: 10px 20px;
  border-radius: 6px;
  margin-bottom: 15px;
  border: 1px solid var(--border-color);
  user-select: none;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 10px;
  border-right: 1px solid var(--border-color);
}

.username-label {
  font-size: 14px;
  font-weight: 600;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background-color: var(--border-color);
}

.date-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-label {
  font-size: 14px;
  font-weight: 500;
}

.date-input {
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  font-family: sans-serif;
}

.date-input:focus {
  border-color: var(--turn-text);
}

.logout-btn {
  background-color: #bd2130;
  border: none;
  color: white;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #961a26;
}

.logout-icon {
  font-size: 16px;
  font-weight: bold;
}

.btn-icon-img:not(.theme-toggle-icon) {
  filter: var(--icon-filter);
}

.btn-icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
  transition: filter 0.25s ease;
}
</style>
