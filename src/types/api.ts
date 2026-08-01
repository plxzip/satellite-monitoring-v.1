export interface Spacecraft {
  id: number
  name: string
}

export interface WorkType {
  id: number
  name: string
}

export interface WorkInterval {
  id: number
  spacecraft_id: number
  type_id: number
  time_beg: string
  time_end: string
  description?: string | null
}

export interface DefaultColor {
  id: number
  color: string
  type_id: number
}
