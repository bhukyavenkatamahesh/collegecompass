'use client'
import { useState, useEffect } from 'react'

const WORDS = ['College', 'IIT', 'NIT', 'IIIT']

export default function RotatingText() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % WORDS.length)
        setVisible(true)
      }, 350)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <span
      style={{
        display: 'inline-block',
        background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
      }}
    >
      {WORDS[index]}
    </span>
  )
}
