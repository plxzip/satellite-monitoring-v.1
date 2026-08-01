<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleLogin = (e: Event) => {
  e.preventDefault()
  errorMessage.value = ''

  if (!username.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Пожалуйста, заполните все поля'
    return
  }

  isLoading.value = true
  router.push('/chart') // эту строку убарть для реального запроса на сервер

  fetch('/api/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: username.value, password: password.value }),
  })
    .then((response) => {
      isLoading.value = false
      if (!response.ok) {
        throw new Error('Ошибка при входе')
      }
      return response.json()
    })
    .then((data) => {
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        router.push('/chart')
      } else {
        errorMessage.value = data.message || 'Неверные учетные данные'
      }
    })
    .catch((error) => {
      isLoading.value = false
      errorMessage.value = error.message || 'Произошла ошибка при входе'
    })
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h2>Вход в систему</h2>
        <p>Мониторинг работы спутников</p>
      </div>

      <form @submit="handleLogin" class="login-form">
        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <div class="input-group">
          <label for="username">Имя пользователя</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Введите ваш логин"
            autocomplete="username"
            :disabled="isLoading"
          />
        </div>

        <div class="input-group">
          <label for="password">Пароль</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="••••••••"
            autocomplete="current-password"
            :disabled="isLoading"
          />
        </div>

        <button type="submit" class="btn-submit" :disabled="isLoading">
          {{ isLoading ? 'Проверка...' : 'Войти' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 85vh;
}

.login-card {
  background-color: var(--panel-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 40px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.login-header p {
  margin: 0;
  color: #888;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-banner {
  background-color: rgba(220, 53, 69, 0.15);
  border: 1px solid #dc3545;
  color: #ff6b6b;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 13px;
  font-weight: 600;
}

.input-group input {
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.input-group input:focus {
  border-color: #2980b9;
}

.btn-submit {
  background-color: #2980b9;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}

.btn-submit:hover:not(:disabled) {
  background-color: #21618c;
}

.btn-submit:disabled {
  background-color: #566573;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
