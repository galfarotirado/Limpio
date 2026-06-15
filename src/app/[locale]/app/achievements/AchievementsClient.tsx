'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { AchievementProgress } from '@/lib/achievements'

type Category = 'all' | 'time' | 'diary' | 'crisis' | 'savings'

interface Props {
  achievements: AchievementProgress[]
  unlockedCount: number
  total: number
}

export default function AchievementsClient({ achievements, unlockedCount, total }: Props) {
  const t = useTranslations('achievements')
  const [filter, setFilter] = useState<Category>('all')
  const seenRef = useRef<Set<string>>(new Set())

  // Fire confetti + toast for newly-seen unlocked achievements
  useEffect(() => {
    const newlyUnlocked = achievements.filter(
      ({ achievement, unlocked }) => unlocked && !seenRef.current.has(achievement.id)
    )
    if (newlyUnlocked.length > 0) {
      // Only fire if they were JUST loaded (fresh page load) and at least one is unlocked
      // We don't want to spam on every re-render — gate by the initial render only
      const storedSeen = (() => {
        try { return JSON.parse(sessionStorage.getItem('limpio-seen-ach') || '[]') as string[] }
        catch { return [] as string[] }
      })()
      const brandNew = newlyUnlocked.filter(({ achievement }) => !storedSeen.includes(achievement.id))

      if (brandNew.length > 0) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#16a34a', '#4ade80', '#86efac'] })
        brandNew.forEach(({ achievement }) => {
          toast.success(`${achievement.icon} ${t('achievementUnlocked')}`, {
            description: t(achievement.label as any),
            duration: 4000,
          })
        })
        const newSeen = [...storedSeen, ...brandNew.map(a => a.achievement.id)]
        try { sessionStorage.setItem('limpio-seen-ach', JSON.stringify(newSeen)) } catch {}
      }
    }
    achievements.forEach(({ achievement, unlocked }) => {
      if (unlocked) seenRef.current.add(achievement.id)
    })
  }, [achievements, t])

  const filtered = useMemo(() => {
    if (filter === 'all') return achievements
    return achievements.filter(({ achievement }) => achievement.category === filter)
  }, [achievements, filter])

  const categories: { key: Category; label: string }[] = [
    { key: 'all', label: t('filterAll') },
    { key: 'time', label: t('filterTime') },
    { key: 'diary', label: t('filterDiary') },
    { key: 'crisis', label: t('filterCrisis') },
    { key: 'savings', label: t('filterSavings') },
  ]

  async function shareAchievement(achievement: AchievementProgress['achievement']) {
    const text = `${achievement.icon} ${t(achievement.label as any)} — Limpio app`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Limpio', text })
      } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      toast.success(t('shareAchievement'))
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('title')}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('subtitle')}</p>
      <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-5">
        {t('progressText', { unlocked: unlockedCount, total })}
      </p>

      {/* Overall progress bar */}
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-700"
          style={{ width: `${(unlockedCount / total) * 100}%` }}
        />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === key
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(({ achievement, unlocked }) => (
          <div
            key={achievement.id}
            className={`flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 border transition-all ${
              unlocked
                ? 'border-green-100 dark:border-green-800/40 shadow-sm'
                : 'border-gray-100 dark:border-gray-700 opacity-60 grayscale'
            }`}
          >
            <span className="text-3xl w-10 text-center flex-shrink-0" aria-hidden="true">
              {achievement.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {t(achievement.label as any)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t(achievement.description as any)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {unlocked && (
                <button
                  onClick={() => shareAchievement(achievement)}
                  aria-label={t('shareAchievement')}
                  className="text-gray-300 hover:text-green-500 dark:text-gray-600 dark:hover:text-green-400 transition-colors text-base"
                >
                  🔗
                </button>
              )}
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                unlocked
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}>
                {unlocked ? t('unlocked') : t('locked')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
