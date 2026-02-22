import { TARGET_WIDTH, TARGET_HEIGHT } from '../../types/app'

/**
 * 書き出し範囲（1200x720）を視覚的に示すガイド枠を表示するコンポーネント
 */
export function OverlayGuide() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0 border-2 border-white/40 bg-transparent"
      >
        {/* 解像度表示 */}
        <div className="absolute -top-6 left-0 text-xs text-white/60 font-mono">
          {TARGET_WIDTH} x {TARGET_HEIGHT} (5:3)
        </div>

        {/* センターガイド（十字線） */}
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
