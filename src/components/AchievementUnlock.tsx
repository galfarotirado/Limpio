'use client'

import { useEffect } from 'react'
import { Achievement } from '@/types'

interface Props {
  achievement: Achievement
  onClose: () => void
}

export default function AchievementUnlock({ achievement, onClose }: Props) {
  useEffect(() => {
    // Dynamically import canvas-confetti to avoid SSR issues
    import('canvas-confetti').then((confetti) => {
      confetti.default({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#16a34a', '#4ade80', '#86efac', '#fbbf24', '#f9fafb'],
      })
    })

    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4 animate-bounce">{achievement.icon}</div>
        <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1">
          🏆 Logro desbloqueado
        </p>
        <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{achievement.label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{achievement.description}</p>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          ¡Gracias! 🎉
        </button>
      </div>
    </div>
  )
}
