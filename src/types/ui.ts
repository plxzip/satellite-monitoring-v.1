export interface WorkVisibilityConfig {
  all: boolean
  satellites: Record<number, boolean>
}

export interface UserSettingsItem {
  visible: WorkVisibilityConfig
  color: string
}

export type UserSettings = Record<number, UserSettingsItem>
