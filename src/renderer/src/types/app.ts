/** 投影方式の種類: VR180, VR360, 平面 */
export type ProjectionType = 'VR180_SBS' | 'VR360_EQUI' | 'FLAT'

/** ビューアーの再生・表示モードに関する状態 */
export interface ViewerState {
  /** 動画ファイルのパス */
  videoPath: string | null
  /** 動画ファイルのファイル名 */
  videoFileName: string | null
  /** 現在の投影方式 */
  projection: ProjectionType
  /** 左右(水平)の回転角 */
  yaw: number
  /** 上下(垂直)の回転角 */
  pitch: number
  /** 視野角 */
  fov: number
  /** 再生中かどうか */
  isPlaying: boolean
  /** 現在表示している目（左目/右目） */
  eye: 'left' | 'right'
  /** 動画の現在再生時間（秒） */
  currentTime: number
  /** 動画の総時間（秒） */
  duration: number
}

/** ビューアーを操作するためのアクション */
export interface ViewerActions {
  /** 動画パスを設定する */
  setVideoPath: (path: string | null, fileName?: string | null) => void
  /** 投影方式を設定する */
  setProjection: (type: ProjectionType) => void
  /** ヨー（水平回転）を設定する */
  setYaw: (val: number) => void
  /** ピッチ（垂直回転）を設定する */
  setPitch: (val: number) => void
  /** FOV（視野角）を設定する */
  setFov: (val: number) => void
  /** 再生/一時停止を切り替える */
  togglePlay: () => void
  /** 再生状態を直接設定する */
  setIsPlaying: (val: boolean) => void
  /** 表示する目を設定する */
  setEye: (eye: 'left' | 'right') => void
  /** 再生位置を設定する */
  setCurrentTime: (time: number) => void
  /** 動画の長さを設定する */
  setDuration: (duration: number) => void
  /** 状態を初期化する */
  reset: () => void
}

/** 書き出し用キャンバスの標準幅 */
export const TARGET_WIDTH = 1200
/** 書き出し用キャンバスの標準高さ */
export const TARGET_HEIGHT = 720
/** 標準アスペクト比 */
export const TARGET_ASPECT = TARGET_WIDTH / TARGET_HEIGHT

/** 初期設定の回転角(ヨー) */
export const DEFAULT_YAW = 0
/** 初期設定の回転角(ピッチ) */
export const DEFAULT_PITCH = 0
/** 初期設定の視野角(FOV) */
export const DEFAULT_FOV = 75

/** 回転角(ヨー)の最小値 */
export const YAW_MIN = -180
/** 回転角(ヨー)の最大値 */
export const YAW_MAX = 180
/** 回転角(ピッチ)の最小値 */
export const PITCH_MIN = -90
/** 回転角(ピッチ)の最大値 */
export const PITCH_MAX = 90
/** 視野角(FOV)の最小値 */
export const FOV_MIN = 30
/** 視野角(FOV)の最大値 */
export const FOV_MAX = 110
