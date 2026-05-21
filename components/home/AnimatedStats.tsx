'use client'
import { useEffect, useRef, useState } from 'react'

type Stat = { value: string; label: string; prefix?: string; suffix?: string }

function useCountUp(end: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf: number
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * end))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [end, duration, start])
  return count
}

function StatItem({
  value,
  label,
  prefix = '',
  suffix = '',
  started,
}: Stat & { started: boolean }) {
  const numericPart = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
  const hasPlus = value.includes('+')
  const count = useCountUp(numericPart, 1800, started)

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'Satoshi,Inter,sans-serif',
          fontWeight: 900,
          fontSize: '1.8rem',
          letterSpacing: '-0.04em',
          color: '#fff',
          lineHeight: 1.1,
        }}
      >
        {prefix}
        {started ? count.toLocaleString() : '0'}
        {hasPlus ? '+' : ''}
        {suffix}
      </div>
      <div
        style={{
          fontSize: '0.78rem',
          color: '#64748b',
          fontWeight: 500,
          marginTop: '0.25rem',
        }}
      >
        {label}
      </div>
    </div>
  )
}

export default function AnimatedStats({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="hero-stats" style={{ marginTop: '3rem' }}>
      {stats.map(s => (
        <StatItem key={s.label} {...s} started={started} />
      ))}
    </div>
  )
}
