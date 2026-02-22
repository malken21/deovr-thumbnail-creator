import { useState, useCallback, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { TARGET_WIDTH, TARGET_HEIGHT } from '../../types/app'

/**
 * キャンバス上のスタンプ（バッジ）要素を描画し、ドラッグによる移動を管理するコンポーネント
 */
export function StampOverlay() {
  const { stamps, updateStamp } = useStore()
  const [dragging, setDragging] = useState<string | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // ドラッグ開始時の座標計算
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, stampId: string, stampX: number, stampY: number) => {
      e.preventDefault()
      e.stopPropagation()

      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      dragOffset.current = {
        x: mouseX - stampX,
        y: mouseY - stampY
      }

      setDragging(stampId)
    },
    []
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const newX = mouseX - dragOffset.current.x
      const newY = mouseY - dragOffset.current.y

      updateStamp(dragging, {
        x: Math.max(0, Math.min(TARGET_WIDTH, newX)),
        y: Math.max(0, Math.min(TARGET_HEIGHT, newY))
      })
    },
    [dragging, updateStamp]
  )

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  if (stamps.length === 0) return null

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${dragging ? '' : 'pointer-events-none'}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {stamps.map((stamp) => (
        <img
          key={stamp.id}
          src={stamp.imageUrl || `./stamps/${stamp.type}.png`}
          alt={stamp.name}
          className="absolute cursor-move select-none"
          style={{
            left: stamp.x,
            top: stamp.y,
            transform: `scale(${stamp.scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'auto'
          }}
          onMouseDown={(e) => handleMouseDown(e, stamp.id, stamp.x, stamp.y)}
          draggable={false}
        />
      ))}
    </div>
  )
}
