import { create } from 'zustand'
import type { ViewerState, ViewerActions, ProjectionType } from '../types/app'
import { DEFAULT_YAW, DEFAULT_PITCH, DEFAULT_FOV } from '../types/app'

interface TextOverlay {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  strokeColor: string
  strokeWidth: number
  fontFamily: string
}

interface CustomFont {
  id: string
  name: string
  fontFamily: string
}

interface Stamp {
  id: string
  type: string
  name: string
  x: number
  y: number
  scale: number
  imageUrl?: string
}

interface SavedStamp {
  id: string
  name: string
  imageUrl: string
}

export type ThemeType =
  | 'dark'
  | 'light'
  | 'midnight'
  | 'oled-creative'
  | 'modern-studio'
  | 'cyber-neon'
  | 'cool-dark'
  | 'nordic-night'
  | 'gold-obsidian'
  | 'hacker-mode'
  | 'rose-quartz'

interface ThemeState {
  theme: ThemeType
}

interface ThemeActions {
  setTheme: (theme: ThemeType) => void
}

interface ExportState {
  canvasElement: HTMLCanvasElement | null
  textOverlays: TextOverlay[]
  stamps: Stamp[]
  savedStamps: SavedStamp[]
  customFonts: CustomFont[]
}

interface ExportActions {
  setCanvasElement: (canvas: HTMLCanvasElement | null) => void
  addTextOverlay: () => void
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void
  removeTextOverlay: (id: string) => void
  addStamp: (type: string) => void
  addStampFromSaved: (savedStampId: string) => void
  addCustomStamp: (name: string, imageUrl: string) => void
  saveCustomStamp: (name: string, imageUrl: string) => void
  deleteSavedStamp: (id: string) => void
  loadSavedStamps: () => void
  updateStamp: (id: string, updates: Partial<Stamp>) => void
  removeStamp: (id: string) => void
  addCustomFont: (name: string, fontData: string) => void
  deleteCustomFont: (id: string) => void
  loadCustomFonts: () => void
  exportThumbnail: () => void
}

// Popular preset fonts available on most systems
export const PRESET_FONTS = [
  { value: 'sans-serif', label: 'Sans Serif (Default)' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif', label: 'Hiragino Sans (ヒラギノ角ゴ)' },
  { value: '"Yu Gothic", "游ゴシック", sans-serif', label: 'Yu Gothic (游ゴシック)' },
  { value: '"Noto Sans JP", sans-serif', label: 'Noto Sans JP' },
  { value: 'serif', label: 'Serif' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Hiragino Mincho ProN", serif', label: 'Hiragino Mincho (ヒラギノ明朝)' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: '"Comic Sans MS", cursive', label: 'Comic Sans MS' },
]

type Store = ViewerState & ViewerActions & ExportState & ExportActions & ThemeState & ThemeActions

const SAVED_STAMPS_KEY = 'deovr-thumbnail-saved-stamps'
const CUSTOM_FONTS_KEY = 'deovr-thumbnail-custom-fonts'
const THEME_KEY = 'deovr-thumbnail-theme'

const loadThemeFromStorage = (): ThemeType => {
  try {
    const data = localStorage.getItem(THEME_KEY)
    return (data as ThemeType) || 'dark'
  } catch {
    return 'dark'
  }
}

const applyThemeToDocument = (theme: ThemeType) => {
  document.documentElement.setAttribute('data-theme', theme)
}

const loadSavedStampsFromStorage = (): SavedStamp[] => {
  try {
    const data = localStorage.getItem(SAVED_STAMPS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const loadCustomFontsFromStorage = (): CustomFont[] => {
  try {
    const data = localStorage.getItem(CUSTOM_FONTS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const initialTheme = loadThemeFromStorage()
// Apply theme on initial load
if (typeof document !== 'undefined') {
  applyThemeToDocument(initialTheme)
}

const initialState: ViewerState & ExportState & ThemeState = {
  videoPath: null,
  videoFileName: null,
  projection: 'VR180_SBS',
  yaw: DEFAULT_YAW,
  pitch: DEFAULT_PITCH,
  fov: DEFAULT_FOV,
  isPlaying: false,
  eye: 'left',
  currentTime: 0,
  duration: 0,
  canvasElement: null,
  textOverlays: [],
  stamps: [],
  savedStamps: loadSavedStampsFromStorage(),
  customFonts: loadCustomFontsFromStorage(),
  theme: initialTheme
}

export const useStore = create<Store>((set, get) => ({
  ...initialState,

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme)
    applyThemeToDocument(theme)
    set({ theme })
  },

  setVideoPath: (path, fileName) => set({ videoPath: path, videoFileName: fileName ?? null }),
  setProjection: (type: ProjectionType) => set({ projection: type }),
  setYaw: (val) => set({ yaw: val }),
  setPitch: (val) => set({ pitch: val }),
  setFov: (val) => set({ fov: val }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (val) => set({ isPlaying: val }),
  setEye: (eye) => set({ eye }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  reset: () => set(initialState),

  setCanvasElement: (canvas) => set({ canvasElement: canvas }),

  addTextOverlay: () => {
    const id = `text_${Date.now()}`
    set((state) => ({
      textOverlays: [
        ...state.textOverlays,
        {
          id,
          text: 'New Text',
          x: 600,
          y: 650,
          fontSize: 48,
          color: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 4,
          fontFamily: 'sans-serif'
        }
      ]
    }))
  },

  updateTextOverlay: (id, updates) => {
    set((state) => ({
      textOverlays: state.textOverlays.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      )
    }))
  },

  removeTextOverlay: (id) => {
    set((state) => ({
      textOverlays: state.textOverlays.filter((overlay) => overlay.id !== id)
    }))
  },

  addStamp: (type) => {
    const id = `stamp_${Date.now()}`
    const stampNames: Record<string, string> = {
      vr180: 'VR180'
    }
    set((state) => ({
      stamps: [
        ...state.stamps,
        {
          id,
          type,
          name: stampNames[type] || type,
          x: 100,
          y: 100,
          scale: 1
        }
      ]
    }))
  },

  addCustomStamp: (name, imageUrl) => {
    const id = `stamp_${Date.now()}`
    set((state) => ({
      stamps: [
        ...state.stamps,
        {
          id,
          type: 'custom',
          name,
          x: 100,
          y: 100,
          scale: 1,
          imageUrl
        }
      ]
    }))
  },

  addStampFromSaved: (savedStampId) => {
    const { savedStamps } = get()
    const savedStamp = savedStamps.find((s) => s.id === savedStampId)
    if (!savedStamp) return

    const id = `stamp_${Date.now()}`
    set((state) => ({
      stamps: [
        ...state.stamps,
        {
          id,
          type: 'custom',
          name: savedStamp.name,
          x: 100,
          y: 100,
          scale: 1,
          imageUrl: savedStamp.imageUrl
        }
      ]
    }))
  },

  saveCustomStamp: (name, imageUrl) => {
    const id = `saved_${Date.now()}`
    const newSavedStamp: SavedStamp = { id, name, imageUrl }
    set((state) => {
      const newSavedStamps = [...state.savedStamps, newSavedStamp]
      localStorage.setItem(SAVED_STAMPS_KEY, JSON.stringify(newSavedStamps))
      return { savedStamps: newSavedStamps }
    })
  },

  deleteSavedStamp: (id) => {
    set((state) => {
      const newSavedStamps = state.savedStamps.filter((s) => s.id !== id)
      localStorage.setItem(SAVED_STAMPS_KEY, JSON.stringify(newSavedStamps))
      return { savedStamps: newSavedStamps }
    })
  },

  loadSavedStamps: () => {
    set({ savedStamps: loadSavedStampsFromStorage() })
  },

  updateStamp: (id, updates) => {
    set((state) => ({
      stamps: state.stamps.map((stamp) =>
        stamp.id === id ? { ...stamp, ...updates } : stamp
      )
    }))
  },

  removeStamp: (id) => {
    set((state) => ({
      stamps: state.stamps.filter((stamp) => stamp.id !== id)
    }))
  },

  addCustomFont: (name, fontData) => {
    const id = `font_${Date.now()}`
    const fontFamily = `CustomFont_${id}`

    // Register the font with FontFace API
    const font = new FontFace(fontFamily, `url(${fontData})`)
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont)
    })

    const newFont: CustomFont = { id, name, fontFamily }
    set((state) => {
      const newCustomFonts = [...state.customFonts, newFont]
      localStorage.setItem(CUSTOM_FONTS_KEY, JSON.stringify(newCustomFonts.map(f => ({ ...f, fontData }))))
      return { customFonts: newCustomFonts }
    })
  },

  deleteCustomFont: (id) => {
    set((state) => {
      const newCustomFonts = state.customFonts.filter((f) => f.id !== id)
      localStorage.setItem(CUSTOM_FONTS_KEY, JSON.stringify(newCustomFonts))
      return { customFonts: newCustomFonts }
    })
  },

  loadCustomFonts: () => {
    const fonts = loadCustomFontsFromStorage()
    // Re-register fonts with FontFace API
    fonts.forEach((font: CustomFont & { fontData?: string }) => {
      if (font.fontData) {
        const fontFace = new FontFace(font.fontFamily, `url(${font.fontData})`)
        fontFace.load().then((loadedFont) => {
          document.fonts.add(loadedFont)
        })
      }
    })
    set({ customFonts: fonts })
  },

  exportThumbnail: async () => {
    const { canvasElement, textOverlays, stamps } = get()
    if (!canvasElement) return

    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = 1200
    exportCanvas.height = 720
    const ctx = exportCanvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(canvasElement, 0, 0)

    // Draw stamps
    const stampImages = await Promise.all(
      stamps.map((stamp) => {
        return new Promise<{ stamp: typeof stamp; img: HTMLImageElement }>((resolve) => {
          const img = new Image()
          img.onload = () => resolve({ stamp, img })
          img.onerror = () => resolve({ stamp, img })
          img.src = stamp.imageUrl || `./stamps/${stamp.type}.png`
        })
      })
    )

    stampImages.forEach(({ stamp, img }) => {
      if (img.complete && img.naturalWidth > 0) {
        const width = img.naturalWidth * stamp.scale
        const height = img.naturalHeight * stamp.scale
        ctx.drawImage(img, stamp.x, stamp.y, width, height)
      }
    })

    // Draw text overlays
    textOverlays.forEach((overlay) => {
      ctx.font = `bold ${overlay.fontSize}px ${overlay.fontFamily}`
      ctx.fillStyle = overlay.color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.strokeStyle = overlay.strokeColor
      ctx.lineWidth = overlay.strokeWidth
      ctx.strokeText(overlay.text, overlay.x, overlay.y)
      ctx.fillText(overlay.text, overlay.x, overlay.y)
    })

    const dataURL = exportCanvas.toDataURL('image/png')

    // Show save dialog
    const defaultName = `thumbnail_${Date.now()}.png`
    const result = await window.electron.showSaveDialog(defaultName)

    if (result.canceled || !result.filePath) return

    // Save file
    await window.electron.saveFile(result.filePath, dataURL)
  }
}))
