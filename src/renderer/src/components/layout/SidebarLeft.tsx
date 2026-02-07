import { useCallback, useState, useRef, useEffect, type DragEvent } from 'react'
import { Upload, Play, Pause, RotateCcw, Video, Type, Plus, Trash2, Sticker, ChevronDown } from 'lucide-react'
import { useStore, PRESET_FONTS } from '../../store/useStore'
import { useI18n } from '../../hooks/useI18n'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Slider } from '../ui/Slider'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import type { ProjectionType } from '../../types/app'

const stampOptions = [
  { value: 'vr180', label: 'VR180' },
  { value: 'vr360', label: 'VR360' },
  { value: '4k', label: '4K' },
  { value: '8k', label: '8K' },
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Triangle' }
]

export function SidebarLeft() {
  const { t } = useI18n()

  const {
    videoPath,
    setVideoPath,
    projection,
    setProjection,
    isPlaying,
    togglePlay,
    currentTime,
    setCurrentTime,
    duration,
    reset,
    textOverlays,
    addTextOverlay,
    updateTextOverlay,
    removeTextOverlay,
    stamps,
    addStamp,
    addCustomStamp,
    addStampFromSaved,
    saveCustomStamp,
    deleteSavedStamp,
    savedStamps,
    updateStamp,
    removeStamp,
    customFonts,
    addCustomFont,
    deleteCustomFont
  } = useStore()

  const [isDragging, setIsDragging] = useState(false)
  const [selectedStampType, setSelectedStampType] = useState<string>('')
  const [saveStampAfterUpload, setSaveStampAfterUpload] = useState(true)
  const [stampDropdownOpen, setStampDropdownOpen] = useState(false)
  const [fontDropdownOpen, setFontDropdownOpen] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stampInputRef = useRef<HTMLInputElement>(null)
  const fontInputRef = useRef<HTMLInputElement>(null)
  const stampDropdownRef = useRef<HTMLDivElement>(null)
  const fontDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stampDropdownRef.current && !stampDropdownRef.current.contains(e.target as Node)) {
        setStampDropdownOpen(false)
      }
      // Close font dropdowns
      Object.entries(fontDropdownRefs.current).forEach(([id, ref]) => {
        if (ref && !ref.contains(e.target as Node)) {
          setFontDropdownOpen((prev) => (prev === id ? null : prev))
        }
      })
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('video/')) {
          const path = (file as File & { path?: string }).path || URL.createObjectURL(file)
          setVideoPath(path.startsWith('/') ? `file://${path}` : path, file.name)
        }
      }
    },
    [setVideoPath]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0]
        const path = (file as File & { path?: string }).path || URL.createObjectURL(file)
        setVideoPath(path.startsWith('/') ? `file://${path}` : path, file.name)
      }
    },
    [setVideoPath]
  )

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleStampUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const imageUrl = event.target?.result as string
            const name = file.name.replace(/\.[^/.]+$/, '')
            addCustomStamp(name, imageUrl)
            if (saveStampAfterUpload) {
              saveCustomStamp(name, imageUrl)
            }
          }
          reader.readAsDataURL(file)
        }
      }
      e.target.value = ''
    },
    [addCustomStamp, saveCustomStamp, saveStampAfterUpload]
  )

  const handleAddSelectedStamp = useCallback(() => {
    if (!selectedStampType) return

    if (selectedStampType.startsWith('saved_')) {
      addStampFromSaved(selectedStampType)
    } else {
      addStamp(selectedStampType)
    }
    setSelectedStampType('')
  }, [selectedStampType, addStamp, addStampFromSaved])

  const handleStampBrowseClick = useCallback(() => {
    stampInputRef.current?.click()
  }, [])

  const handleFontUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0]
        if (file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const fontData = event.target?.result as string
            const name = file.name.replace(/\.[^/.]+$/, '')
            addCustomFont(name, fontData)
          }
          reader.readAsDataURL(file)
        }
      }
      e.target.value = ''
    },
    [addCustomFont]
  )

  const handleFontBrowseClick = useCallback(() => {
    fontInputRef.current?.click()
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Video className="w-6 h-6 text-primary" />
        <h1 className="text-lg font-semibold">{t('app.title')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('videoSource.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'}
            `}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {videoPath ? t('videoSource.dropToReplace') : t('videoSource.dropHint')}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {videoPath && (
            <p className="text-xs text-muted-foreground truncate">
              {videoPath.replace('file://', '')}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('projection.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            options={[
              { value: 'VR180_SBS', label: t('projection.vr180sbs') },
              { value: 'VR360_EQUI', label: t('projection.vr360') },
              { value: 'FLAT', label: t('projection.flat') }
            ]}
            value={projection}
            onChange={(e) => setProjection(e.target.value as ProjectionType)}
          />
        </CardContent>
      </Card>

      {videoPath && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('playback.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={reset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {duration > 0 && (
              <div className="space-y-2">
                <Slider
                  value={currentTime}
                  min={0}
                  max={duration}
                  step={0.1}
                  onChange={setCurrentTime}
                  showValue={false}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="w-4 h-4" />
            {t('textOverlays.title')}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={addTextOverlay}>
            <Plus className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {textOverlays.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t('textOverlays.addHint')}
            </p>
          ) : (
            textOverlays.map((overlay) => (
              <div key={overlay.id} className="space-y-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={overlay.text}
                    onChange={(e) => updateTextOverlay(overlay.id, { text: e.target.value })}
                    className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm"
                    placeholder={t('textOverlays.placeholder')}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTextOverlay(overlay.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">{t('textOverlays.font')}</label>
                  <div
                    ref={(el) => { fontDropdownRefs.current[overlay.id] = el }}
                    className="relative"
                  >
                    <button
                      type="button"
                      onClick={() => setFontDropdownOpen(fontDropdownOpen === overlay.id ? null : overlay.id)}
                      className="w-full flex items-center justify-between gap-2 bg-background border border-border rounded px-2 py-1.5 text-sm hover:border-muted-foreground transition-colors"
                      style={{ fontFamily: overlay.fontFamily }}
                    >
                      <span className="truncate">
                        {PRESET_FONTS.find((f) => f.value === overlay.fontFamily)?.label ||
                          customFonts.find((f) => f.fontFamily === overlay.fontFamily)?.name ||
                          overlay.fontFamily}
                      </span>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${fontDropdownOpen === overlay.id ? 'rotate-180' : ''}`} />
                    </button>

                    {fontDropdownOpen === overlay.id && (
                      <div className="absolute z-50 mt-1 w-full bg-background border border-border rounded shadow-lg max-h-60 overflow-auto">
                        <div className="px-2 py-1 text-xs text-muted-foreground font-medium bg-muted/30">
                          {t('textOverlays.presetFonts')}
                        </div>
                        {PRESET_FONTS.map((font) => (
                          <button
                            key={font.value}
                            type="button"
                            onClick={() => {
                              updateTextOverlay(overlay.id, { fontFamily: font.value })
                              setFontDropdownOpen(null)
                            }}
                            className={`w-full text-left px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors ${
                              overlay.fontFamily === font.value ? 'bg-muted' : ''
                            }`}
                            style={{ fontFamily: font.value }}
                          >
                            {font.label}
                          </button>
                        ))}

                        {customFonts.length > 0 && (
                          <>
                            <div className="px-2 py-1 text-xs text-muted-foreground font-medium bg-muted/30 border-t border-border">
                              {t('textOverlays.customFonts')}
                            </div>
                            {customFonts.map((font) => (
                              <div
                                key={font.id}
                                className={`flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 transition-colors ${
                                  overlay.fontFamily === font.fontFamily ? 'bg-muted' : ''
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateTextOverlay(overlay.id, { fontFamily: font.fontFamily })
                                    setFontDropdownOpen(null)
                                  }}
                                  className="flex-1 text-left text-sm"
                                  style={{ fontFamily: font.fontFamily }}
                                >
                                  {font.name}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteCustomFont(font.id)
                                  }}
                                  className="text-destructive hover:text-destructive/80 ml-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </>
                        )}

                        <div className="border-t border-border">
                          <button
                            type="button"
                            onClick={() => {
                              handleFontBrowseClick()
                              setFontDropdownOpen(null)
                            }}
                            className="w-full text-left px-2 py-1.5 text-sm text-primary hover:bg-muted/50 transition-colors flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            {t('textOverlays.uploadFont')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fontInputRef}
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={handleFontUpload}
                    className="hidden"
                  />
                </div>

                <Slider
                  label={t('textOverlays.size')}
                  value={overlay.fontSize}
                  min={16}
                  max={120}
                  step={2}
                  onChange={(val) => updateTextOverlay(overlay.id, { fontSize: val })}
                />

                <Slider
                  label={t('textOverlays.xPosition')}
                  value={overlay.x}
                  min={0}
                  max={1200}
                  step={10}
                  onChange={(val) => updateTextOverlay(overlay.id, { x: val })}
                />

                <Slider
                  label={t('textOverlays.yPosition')}
                  value={overlay.y}
                  min={0}
                  max={720}
                  step={10}
                  onChange={(val) => updateTextOverlay(overlay.id, { y: val })}
                />

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">{t('textOverlays.textColor')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={overlay.color}
                      onChange={(e) => updateTextOverlay(overlay.id, { color: e.target.value })}
                      className="w-10 h-8 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <select
                      value={overlay.color}
                      onChange={(e) => updateTextOverlay(overlay.id, { color: e.target.value })}
                      className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm"
                    >
                      <option value="" disabled>{t('textOverlays.custom')}</option>
                      <option value="#ffffff">{t('colors.white')}</option>
                      <option value="#000000">{t('colors.black')}</option>
                      <option value="#ff0000">{t('colors.red')}</option>
                      <option value="#00ff00">{t('colors.green')}</option>
                      <option value="#0000ff">{t('colors.blue')}</option>
                      <option value="#ffff00">{t('colors.yellow')}</option>
                      <option value="#ff00ff">{t('colors.magenta')}</option>
                      <option value="#00ffff">{t('colors.cyan')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">{t('textOverlays.strokeColor')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={overlay.strokeColor}
                      onChange={(e) => updateTextOverlay(overlay.id, { strokeColor: e.target.value })}
                      className="w-10 h-8 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <select
                      value={overlay.strokeColor}
                      onChange={(e) => updateTextOverlay(overlay.id, { strokeColor: e.target.value })}
                      className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm"
                    >
                      <option value="" disabled>{t('textOverlays.custom')}</option>
                      <option value="#ffffff">{t('colors.white')}</option>
                      <option value="#000000">{t('colors.black')}</option>
                      <option value="#ff0000">{t('colors.red')}</option>
                      <option value="#00ff00">{t('colors.green')}</option>
                      <option value="#0000ff">{t('colors.blue')}</option>
                      <option value="#ffff00">{t('colors.yellow')}</option>
                      <option value="#ff00ff">{t('colors.magenta')}</option>
                      <option value="#00ffff">{t('colors.cyan')}</option>
                    </select>
                  </div>
                </div>

                <Slider
                  label={t('textOverlays.strokeWidth')}
                  value={overlay.strokeWidth}
                  min={0}
                  max={20}
                  step={1}
                  onChange={(val) => updateTextOverlay(overlay.id, { strokeWidth: val })}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sticker className="w-4 h-4" />
            {t('stamps.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <div ref={stampDropdownRef} className="flex-1 relative">
                <button
                  type="button"
                  onClick={() => setStampDropdownOpen(!stampDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 bg-background border border-border rounded px-2 py-1.5 text-sm hover:border-muted-foreground transition-colors"
                >
                  {selectedStampType ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          selectedStampType.startsWith('saved_')
                            ? savedStamps.find((s) => s.id === selectedStampType)?.imageUrl
                            : `./stamps/${selectedStampType}.png`
                        }
                        alt=""
                        className="w-5 h-5 object-contain"
                      />
                      <span className="truncate">
                        {selectedStampType.startsWith('saved_')
                          ? savedStamps.find((s) => s.id === selectedStampType)?.name
                          : stampOptions.find((o) => o.value === selectedStampType)?.label}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">{t('stamps.selectStamp')}</span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${stampDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {stampDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-background border border-border rounded shadow-lg max-h-60 overflow-auto">
                    <div className="px-2 py-1 text-xs text-muted-foreground font-medium bg-muted/30">
                      {t('stamps.builtIn')}
                    </div>
                    {stampOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedStampType(opt.value)
                          setStampDropdownOpen(false)
                        }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors ${
                          selectedStampType === opt.value ? 'bg-muted' : ''
                        }`}
                      >
                        <img
                          src={`./stamps/${opt.value}.png`}
                          alt={opt.label}
                          className="w-6 h-6 object-contain"
                        />
                        <span>{opt.label}</span>
                      </button>
                    ))}

                    {savedStamps.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-muted-foreground font-medium bg-muted/30 border-t border-border">
                          {t('stamps.saved')}
                        </div>
                        {savedStamps.map((saved) => (
                          <button
                            key={saved.id}
                            type="button"
                            onClick={() => {
                              setSelectedStampType(saved.id)
                              setStampDropdownOpen(false)
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors ${
                              selectedStampType === saved.id ? 'bg-muted' : ''
                            }`}
                          >
                            <img
                              src={saved.imageUrl}
                              alt={saved.name}
                              className="w-6 h-6 object-contain"
                            />
                            <span className="truncate">{saved.name}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSelectedStamp}
                disabled={!selectedStampType}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleStampBrowseClick}
              >
                <Upload className="w-3 h-3 mr-1" />
                {t('stamps.uploadCustom')}
              </Button>
              <input
                ref={stampInputRef}
                type="file"
                accept="image/*"
                onChange={handleStampUpload}
                className="hidden"
              />
            </div>

            <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={saveStampAfterUpload}
                onChange={(e) => setSaveStampAfterUpload(e.target.checked)}
                className="rounded border-border"
                style={{ marginTop: 3 }}
              />
              {t('stamps.saveToLibrary')}
            </label>
          </div>

          {savedStamps.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{t('stamps.savedLibrary')}</p>
              <div className="flex flex-wrap gap-1">
                {savedStamps.map((saved) => (
                  <div
                    key={saved.id}
                    className="flex items-center gap-1 bg-muted/50 rounded px-2 py-1 text-xs"
                  >
                    <img
                      src={saved.imageUrl}
                      alt={saved.name}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="truncate max-w-[60px]" title={saved.name}>{saved.name}</span>
                    <button
                      onClick={() => deleteSavedStamp(saved.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stamps.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{t('stamps.activeStamps')}</p>
              {stamps.map((stamp) => (
                <div key={stamp.id} className="space-y-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate max-w-[150px]" title={stamp.name}>
                      {stamp.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStamp(stamp.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <Slider
                    label={t('stamps.scale')}
                    value={stamp.scale}
                    min={0.1}
                    max={2}
                    step={0.1}
                    onChange={(val) => updateStamp(stamp.id, { scale: val })}
                  />

                  <Slider
                    label={t('textOverlays.xPosition')}
                    value={stamp.x}
                    min={0}
                    max={1200}
                    step={10}
                    onChange={(val) => updateStamp(stamp.id, { x: val })}
                  />

                  <Slider
                    label={t('textOverlays.yPosition')}
                    value={stamp.y}
                    min={0}
                    max={720}
                    step={10}
                    onChange={(val) => updateStamp(stamp.id, { y: val })}
                  />
                </div>
              ))}
            </div>
          )}

          {stamps.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t('stamps.addHint')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
