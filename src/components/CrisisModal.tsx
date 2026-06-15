'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

interface Props {
  reasons: string[]
  userId: string
  onClose: () => void
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'idle'
const PHASES: { phase: Phase; duration: number }[] = [
  { phase: 'inhale', duration: 4 },
  { phase: 'hold', duration: 7 },
  { phase: 'exhale', duration: 8 },
]

export default function CrisisModal({ reasons, userId, onClose }: Props) {
  const t = useTranslations('dashboard')
  const [logged, setLogged] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(-1) // -1 = not started
  const [countdown, setCountdown] = useState(0)
  const [breathScale, setBreathScale] = useState(1)

  const currentPhase = phaseIndex >= 0 ? PHASES[phaseIndex] : null

  const startBreathing = useCallback(() => {
    // Haptic feedback
    if ('vibrate' in navigator) navigator.vibrate(50)
    setPhaseIndex(0)
    setCountdown(PHASES[0].duration)
  }, [])

  useEffect(() => {
    if (phaseIndex < 0) return

    const phase = PHASES[phaseIndex]
    setBreathScale(phase.phase === 'inhale' ? 1.5 : phase.phase === 'exhale' ? 0.85 : 1.5)

    if (countdown <= 0) {
      const nextIndex = (phaseIndex + 1) % PHASES.length
      setPhaseIndex(nextIndex)
      setCountdown(PHASES[nextIndex].duration)
      return
    }

    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [phaseIndex, countdown])

  async function handleClose() {
    if (!logged) {
      const supabase = createClient()
      await supabase.from('cravings').insert({
        user_id: userId,
        intensity: 5,
        trigger_text: 'crisis_button',
        resisted: true,
      })
      setLogged(true)
    }
    onClose()
  }

  const phaseLabel = currentPhase
    ? currentPhase.phase === 'inhale'
      ? t('crisisBreathInhale')
      : currentPhase.phase === 'hold'
        ? t('crisisBreathHold')
        : t('crisisBreathExhale')
    : null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('crisisTitle')}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-slide-up">
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🛡️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('crisisTitle')}</h2>
          <p className="text-sm text-green-700 dark:text-green-400 font-medium mt-1 bg-green-50 dark:bg-green-900/30 rounded-xl px-4 py-2">
            {t('crisisTip')}
          </p>
        </div>

        {reasons.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              {t('crisisReasons')}
            </p>
            <ul className="space-y-1.5">
              {reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Animated breathing exercise */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 mb-5 text-center">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-4">
            {t('crisisBreathTitle')}
          </p>

          {phaseIndex < 0 ? (
            <>
              <div className="flex justify-center gap-4 text-xs text-green-800 dark:text-green-300 mb-4">
                <span>
                  <strong>{t('crisisBreathInhale')}</strong> {t('crisisBreathSeconds', { n: 4 })}
                </span>
                <span>
                  <strong>{t('crisisBreathHold')}</strong> {t('crisisBreathSeconds', { n: 7 })}
                </span>
                <span>
                  <strong>{t('crisisBreathExhale')}</strong> {t('crisisBreathSeconds', { n: 8 })}
                </span>
              </div>
              <button
                onClick={startBreathing}
                className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-5 py-2 rounded-full transition-colors"
              >
                Empezar
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {/* Breathing circle */}
              <div
                className="w-20 h-20 rounded-full bg-green-400/30 dark:bg-green-400/20 border-4 border-green-500 flex items-center justify-center transition-transform"
                style={{
                  transform: `scale(${breathScale})`,
                  transitionDuration: `${currentPhase?.duration ?? 4}s`,
                  transitionTimingFunction: currentPhase?.phase === 'hold' ? 'linear' : 'ease-in-out',
                }}
              >
                <span className="text-2xl font-bold text-green-700 dark:text-green-300">{countdown}</span>
              </div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                {phaseLabel}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-2xl text-sm transition-colors"
        >
          {t('crisisClose')}
        </button>
      </div>
    </div>
  )
}
