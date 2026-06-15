'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

const TOTAL_STEPS = 3

export default function OnboardingPage() {
  const t = useTranslations('onboarding')
  const locale = useLocale()
  const router = useRouter()

  const today = new Date().toISOString().split('T')[0]
  const [step, setStep] = useState(1)

  // Step 1 — profile
  const [name, setName] = useState('')
  const [quitDate, setQuitDate] = useState(today)

  // Step 2 — consumption
  const [dailyCost, setDailyCost] = useState('5')
  const [currency, setCurrency] = useState('EUR')
  const [porros, setPorros] = useState('')

  // Step 3 — reasons
  const [reasonInput, setReasonInput] = useState('')
  const [reasons, setReasons] = useState<string[]>([])

  const [loading, setLoading] = useState(false)

  function addReason(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && reasonInput.trim()) {
      e.preventDefault()
      setReasons((prev) => [...prev, reasonInput.trim()])
      setReasonInput('')
    }
  }

  function removeReason(i: number) {
    setReasons((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/${locale}/auth/login`); return }

    const quitDateTime = new Date(quitDate + 'T00:00:00')

    await supabase.from('user_profiles').upsert({
      id: user.id,
      display_name: name || null,
      quit_date: quitDateTime.toISOString(),
      daily_cost: parseFloat(dailyCost) || 5,
      currency,
      language: locale,
      reasons,
      porros_per_day: porros ? parseInt(porros) : null,
    })

    router.push(`/${locale}/app`)
    router.refresh()
  }

  const stepTitles = [t('step1Title'), t('step2Title'), t('step3Title')]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{t('subtitle')}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className="flex-1 flex items-center gap-2">
              <div
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-6">
          {t('stepOf', { current: step, total: TOTAL_STEPS })} — {stepTitles[step - 1]}
        </p>

        <form
          onSubmit={step === TOTAL_STEPS ? handleStart : (e) => { e.preventDefault(); setStep(s => s + 1) }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5"
        >
          {/* Step 1: Profile */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('nameLabel')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('quitDateLabel')}</label>
                <input
                  type="date"
                  value={quitDate}
                  max={today}
                  onChange={(e) => setQuitDate(e.target.value)}
                  required
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:bg-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('quitDateHelp')}</p>
              </div>
            </>
          )}

          {/* Step 2: Consumption */}
          {step === 2 && (
            <>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('dailyCostLabel')}</label>
                  <input
                    type="number"
                    value={dailyCost}
                    onChange={(e) => setDailyCost(e.target.value)}
                    min="0"
                    step="0.50"
                    required
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:bg-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('dailyCostHelp')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('currencyLabel')}</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 bg-white dark:bg-gray-900 dark:text-white"
                  >
                    <option value="EUR">EUR €</option>
                    <option value="USD">USD $</option>
                    <option value="GBP">GBP £</option>
                    <option value="MXN">MXN $</option>
                    <option value="COP">COP $</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('porrosLabel')}</label>
                <input
                  type="number"
                  value={porros}
                  onChange={(e) => setPorros(e.target.value)}
                  placeholder={t('porrosPlaceholder')}
                  min="0"
                  step="1"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('porrosHelp')}</p>
              </div>
            </>
          )}

          {/* Step 3: Reasons */}
          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('reasonsLabel')}</label>
              <input
                type="text"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                onKeyDown={addReason}
                placeholder={t('reasonsPlaceholder')}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('reasonsHelp')}</p>
              {reasons.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {reasons.map((r, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-3 py-1.5 rounded-full"
                    >
                      {r}
                      <button
                        type="button"
                        onClick={() => removeReason(i)}
                        className="text-green-400 hover:text-green-600 ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('back')}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
            >
              {loading ? '...' : step === TOTAL_STEPS ? t('start') : t('next')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
