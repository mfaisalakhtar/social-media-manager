'use client'

import { useEffect, useRef, useState } from 'react'

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const triggered = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true
          observer.disconnect()
          const start = Date.now()
          const tick = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

export function AnimatedStat({
  value,
  suffix = '',
  prefix = '',
  label,
  sublabel,
}: {
  value: number
  suffix?: string
  prefix?: string
  label: string
  sublabel?: string
}) {
  const { count, ref } = useCountUp(value)
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: '#c5f06a', fontFamily: 'var(--font-bricolage)' }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-semibold text-white mt-1">{label}</div>
      {sublabel && <div className="text-xs text-gray-500 mt-0.5">{sublabel}</div>}
    </div>
  )
}
