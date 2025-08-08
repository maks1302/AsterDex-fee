import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    onDragStart?: () => void
    onDragEnd?: () => void
  }
>(({ className, onDragStart, onDragEnd, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    onPointerDown={onDragStart}
    onPointerUp={onDragEnd}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onDragStart?.()
      }
    }}
    onKeyUp={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onDragEnd?.()
      }
    }}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-black/30 border border-white/20">
      <SliderPrimitive.Range 
        className="absolute h-full star-gradient rounded-full" 
        style={{
          transform: 'translateZ(0)',
          willChange: 'contents',
          backfaceVisibility: 'hidden',
          contain: 'layout style paint'
        }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className="block h-6 w-6 rounded-full border-2 border-[#efbf84] bg-black shadow-lg ring-offset-background hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#efbf84] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" 
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)', // Force hardware acceleration
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        contain: 'layout style paint',
        transition: 'transform 0.1s ease-out' // Fast, smooth transitions
      }}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
