import { useStore, type ThemeType } from '../../store/useStore'
import { useI18n } from '../../hooks/useI18n'
import { Slider } from '../ui/Slider'
import { Button } from '../ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { RotateCcw, Camera, Download, Globe, Palette } from 'lucide-react'
import {
  YAW_MIN,
  YAW_MAX,
  PITCH_MIN,
  PITCH_MAX,
  FOV_MIN,
  FOV_MAX,
  DEFAULT_YAW,
  DEFAULT_PITCH,
  DEFAULT_FOV
} from '../../types/app'

export function SidebarRight() {
  const { t, language, setLanguage, languageNames, availableLanguages } = useI18n()
  const { yaw, setYaw, pitch, setPitch, fov, setFov, videoPath, exportThumbnail, theme, setTheme } = useStore()

  const handleResetCamera = () => {
    setYaw(DEFAULT_YAW)
    setPitch(DEFAULT_PITCH)
    setFov(DEFAULT_FOV)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6 mt-6">
          <Camera className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold">{t('camera.title')}</h2>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('camera.title')}</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleResetCamera}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <Slider
              label={t('camera.yaw')}
              value={yaw}
              min={YAW_MIN}
              max={YAW_MAX}
              step={1}
              onChange={setYaw}
              disabled={!videoPath}
            />

            <Slider
              label={t('camera.pitch')}
              value={pitch}
              min={PITCH_MIN}
              max={PITCH_MAX}
              step={1}
              onChange={setPitch}
              disabled={!videoPath}
            />

            <Slider
              label={t('camera.fov')}
              value={fov}
              min={FOV_MIN}
              max={FOV_MAX}
              step={1}
              onChange={setFov}
              disabled={!videoPath}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('export.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{t('export.resolution')}: <span className="text-foreground font-mono">1200 x 720</span></p>
            </div>
            <Button
              className="w-full"
              onClick={exportThumbnail}
              disabled={!videoPath}
            >
              <Download className="w-4 h-4 mr-2" />
              {t('export.button')}
            </Button>
          </CardContent>
        </Card>

        {!videoPath && (
          <div className="text-center text-sm text-muted-foreground p-4">
            {t('viewer.dropHint')}
          </div>
        )}
      </div>

      {/* Theme and Language selectors at bottom */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeType)}
            className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm"
          >
            <option value="dark">Dark (Default)</option>
            <option value="light">Light</option>
            <option value="midnight">Midnight Blue</option>
            <option value="oled-creative">OLED Creative</option>
            <option value="modern-studio">Modern Studio</option>
            <option value="cyber-neon">Cyber Neon</option>
            <option value="cool-dark">Cool Dark</option>
            <option value="nordic-night">Nordic Night</option>
            <option value="gold-obsidian">Gold Obsidian</option>
            <option value="hacker-mode">Hacker Mode</option>
            <option value="rose-quartz">Rose Quartz</option>
          </select>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
            className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm"
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>{languageNames[lang]}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
