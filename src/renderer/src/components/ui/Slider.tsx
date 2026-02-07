import { forwardRef, useCallback, useRef, useEffect, type InputHTMLAttributes } from 'react'
import { cn } from './utils'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  label?: string
  showValue?: boolean
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, min, max, step = 1, onChange, label, showValue = true, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null)
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) || internalRef

    const percentage = ((value - min) / (max - min)) * 100

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(parseFloat(e.target.value))
      },
      [onChange]
    )

    useEffect(() => {
      const input = resolvedRef.current
      if (input) {
        input.style.setProperty('--slider-percentage', `${percentage}%`)
      }
    }, [percentage, resolvedRef])

    return (
      <div className={cn('space-y-2', className)}>
        {(label || showValue) && (
          <div className="flex items-center justify-between text-sm">
            {label && <span className="text-muted-foreground">{label}</span>}
            {showValue && <span className="text-foreground font-mono">{value.toFixed(1)}</span>}
          </div>
        )}
        <input
          type="range"
          ref={resolvedRef}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={handleChange}
          className={cn(
            'w-full h-2 rounded-full appearance-none cursor-pointer',
            'bg-secondary',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-primary',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:transition-all',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-webkit-slider-runnable-track]:rounded-full'
          )}
          style={{
            background: `linear-gradient(to right, hsl(240, 4.9%, 83.9%) 0%, hsl(240, 4.9%, 83.9%) ${percentage}%, hsl(240, 3.7%, 15.9%) ${percentage}%, hsl(240, 3.7%, 15.9%) 100%)`
          }}
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = 'Slider'

export { Slider }
