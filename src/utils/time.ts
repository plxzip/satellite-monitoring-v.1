export const parseTimeToMinutes = (timeStr: string): number => {
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
