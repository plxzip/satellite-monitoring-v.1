import { ref, watch } from 'vue'

const getInitialTheme = (): boolean => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    return savedTheme === 'dark'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const isDark = ref<boolean>(getInitialTheme())

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  watch(
    isDark,
    (val) => {
      const root = document.documentElement
      if (val) {
        root.classList.add('dark-theme')
        root.classList.remove('light-theme')
        localStorage.setItem('theme', 'dark')
      } else {
        root.classList.add('light-theme')
        root.classList.remove('dark-theme')
        localStorage.setItem('theme', 'light')
      }
    },
    { immediate: true },
  )

  return { isDark, toggleTheme }
}
