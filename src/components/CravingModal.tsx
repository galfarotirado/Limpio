'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  onClose: () => void
}

export default function CravingModal({ userId, onClose }: Props) {
  const t = useTranslations('cravings')
  const [intensity, setIntensity] = useState(3)
  const [trigger, setTrigger] = useState('')
  const [location, setLocation] = useState('')
  const [resisted, setResisted] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const firstFocusRef = useRef<HTMLButtonElement>(null)
  const lastFocusRef = useRef<HTMLButtonElement>(null)

  // Focus trap
  useEffect(() => {
    firstFocusRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const focusableEls = document.querySelectorAll<HTMLElement>(
          '[data-craving-modal] button, [data-craving-modal] input'
        )
        const first = focusableEls[0]
        const last = focusableEls[focusableEls.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('cravings').insert({
      user_id: userId,
      intensity,
      trigger_text: trigger || null,
      location: location || null,
      resisted,
    })
    setSaved(true)
    setTimeout(onClose, 800)
  }

  if (saved) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center">
          <div className="text-4xl mb-2">{resisted ? '💪' : '💚'}</div>
          <p className="font-semibold text-gray-800 dark:text-white">{t('saved')}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
      data-craving-modal
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('intensityLabel')}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setIntensity(n)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    intensity === n
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('triggerLabel')}
            </label>
            <input
              type="text"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder={t('triggerPlaceholder')}
              className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('locationLabel')}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('locationPlaceholder')}
              className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('resistedLabel')}
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setResisted(true)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  resisted ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                💪 {t('yes')}
              </button>
              <button
                onClick={() => setResisted(false)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  !resisted ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {t('no')}
              </button>
            </div>
          </div>
        </div>

        <button
          ref={lastFocusRef}
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-2xl text-sm transition-colors disabled:opacity-50"
        >
          {saving ? '...' : t('save')}
        </button>
      </div>
    </div>
  )
}
