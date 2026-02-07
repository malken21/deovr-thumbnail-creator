export type ProjectionType = 'VR180_SBS' | 'VR360_EQUI' | 'FLAT'

export interface ViewerState {
  videoPath: string | null
  videoFileName: string | null
  projection: ProjectionType
  yaw: number
  pitch: number
  fov: number
  isPlaying: boolean
  eye: 'left' | 'right'
  currentTime: number
  duration: number
}

export interface ViewerActions {
  setVideoPath: (path: string | null, fileName?: string | null) => void
  setProjection: (type: ProjectionType) => void
  setYaw: (val: number) => void
  setPitch: (val: number) => void
  setFov: (val: number) => void
  togglePlay: () => void
  setIsPlaying: (val: boolean) => void
  setEye: (eye: 'left' | 'right') => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  reset: () => void
}

export const TARGET_WIDTH = 1200
export const TARGET_HEIGHT = 720
export const TARGET_ASPECT = TARGET_WIDTH / TARGET_HEIGHT

export const DEFAULT_YAW = 0
export const DEFAULT_PITCH = 0
export const DEFAULT_FOV = 75

export const YAW_MIN = -180
export const YAW_MAX = 180
export const PITCH_MIN = -90
export const PITCH_MAX = 90
export const FOV_MIN = 30
export const FOV_MAX = 110
