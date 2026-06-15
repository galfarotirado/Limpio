'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getMoneySaved } from '@/lib/achievements'

interface Props {
  quitDate: string
  dailyCost: number
  currency: string
  goal?: number
  savingsGoal?: number
}

export default function MoneySaved({ quitDate, dailyCost, currency, goal, savingsGoal }: Props) {
  const effectiveGoal = goal ?? savingsGoal
  const t = useTranslations('dashboard')
  const safeDailyCost = isNaN(dailyCost) || !isFinite(dailyCost) ? 0 : dailyCost
  const [saved, setSaved] = useState(getMoneySaved(quitDate, safeDailyCost))

  useEffect(() => {
    const interval = setInterval(() => {
      setSaved(getMoneySaved(quitDate, safeDailyCost))
    }, 10000)
    return () => clearInterval(interval)
  }, [quitDate, safeDailyCost])

  const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency

  const safeSaved = isNaN(saved) ? 0 : saved
  const progress = effectiveGoal ? Math.min(100, (safeSaved / effectiveGoal) * 100) : null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('moneySaved')}</p>
      <p className="text-4xl font-bold text-green-600" role="status" aria-live="polite">
        {currencySymbol}{safeSaved.toFixed(2)}
      </p>
      {effectiveGoal && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{t('savingsGoal')}</span>
            <span>{currencySymbol}{effectiveGoal}</span>
          </div>
          <div className="h-2 bg-green-50 dark:bg-green-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{Math.round(isNaN(progress ?? 0) ? 0 : (progress ?? 0))}%</p>
        </div>
      )}
    </div>
  )
}
