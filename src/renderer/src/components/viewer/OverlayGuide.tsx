import { TARGET_WIDTH, TARGET_HEIGHT } from '../../types/app'

export function OverlayGuide() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0 border-2 border-white/40 bg-transparent"
      >
        <div className="absolute -top-6 left-0 text-xs text-white/60 font-mono">
          {TARGET_WIDTH} x {TARGET_HEIGHT} (5:3)
        </div>

        <div className="absolute top-0 left-1/2 w-px h-2 bg-white/30 -translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-px h-2 bg-white/30 -translate-x-1/2" />
        <div className="absolute left-0 top-1/2 w-2 h-px bg-white/30 -translate-y-1/2" />
        <div className="absolute right-0 top-1/2 w-2 h-px bg-white/30 -translate-y-1/2" />

        <div className="absolute top-1 right-1 text-[10px] text-white/40 font-mono">
          DeoVR Guide
        </div>
      </div>
    </div>
  )
}
