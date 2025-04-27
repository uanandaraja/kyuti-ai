"use client"

import { useState, useRef } from 'react'
import { GripVertical } from 'lucide-react'

const BeforeAfterSlider = () => {
  const [isSliding, setIsSliding] = useState(false)
  const [sliderPosition, setSliderPosition] = useState(50)
  const sliderRef = useRef<HTMLDivElement | null>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSliding || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = (x / rect.width) * 100

    setSliderPosition(Math.min(Math.max(percent, 0), 100))
  }

  const beforeImage = "https://storage.nizzy.xyz/IMG_2457.jpg"
  const afterImage = "https://storage.nizzy.xyz/kirana%20dalam%20pickup.png"

  return (
    <div
      ref={sliderRef}
      className="relative h-[400px] w-full cursor-pointer"
      onMouseDown={() => setIsSliding(true)}
      onMouseUp={() => setIsSliding(false)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsSliding(false)}
    >
      {/* before image */}
      <img
        src={beforeImage}
        alt="before"
        className="absolute h-full w-full object-cover"
      />

      {/* after image with clip path */}
      <img
        src={afterImage}
        alt="after"
        className="absolute h-full w-full object-cover"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      />

      {/* slider line */}
      <div
        className="absolute h-full w-1 bg-white cursor-col-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white rounded-full shadow-lg p-2">
          <GripVertical className="h-4 w-4 text-gray-600" />
        </div>
      </div>
    </div>
  )
}

export default BeforeAfterSlider
