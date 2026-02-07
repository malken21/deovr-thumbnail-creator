import { useState, useCallback, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { TARGET_WIDTH, TARGET_HEIGHT } from '../../types/app'

export function TextOverlay() {
  const { textOverlays, updateTextOverlay } = useStore()
  const [dragging, setDragging] = useState<string | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, overlayId: string, overlayX: number, overlayY: number) => {
      e.preventDefault()
      e.stopPropagation()

      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      dragOffset.current = {
        x: mouseX - overlayX,
        y: mouseY - overlayY
      }

      setDragging(overlayId)
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

      updateTextOverlay(dragging, {
        x: Math.max(0, Math.min(TARGET_WIDTH, newX)),
        y: Math.max(0, Math.min(TARGET_HEIGHT, newY))
      })
    },
    [dragging, updateTextOverlay]
  )

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  if (textOverlays.length === 0) return null

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${dragging ? '' : 'pointer-events-none'}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {textOverlays.map((overlay) => (
        <div
          key={overlay.id}
          className="absolute cursor-move select-none"
          style={{
            left: overlay.x,
            top: overlay.y,
            fontSize: overlay.fontSize,
            fontWeight: 'bold',
            fontFamily: overlay.fontFamily,
            lineHeight: 1,
            color: overlay.color,
            transform: 'translate(-50%, -50%)',
            WebkitTextStroke: `${overlay.strokeWidth}px ${overlay.strokeColor}`,
            paintOrder: 'stroke fill',
            whiteSpace: 'nowrap',
            pointerEvents: 'auto'
          }}
          onMouseDown={(e) => handleMouseDown(e, overlay.id, overlay.x, overlay.y)}
        >
          {overlay.text}
        </div>
      ))}
    </div>
  )
}
