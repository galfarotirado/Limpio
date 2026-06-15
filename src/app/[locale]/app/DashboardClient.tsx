'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import LiveCounter from '@/components/LiveCounter'
import MoneySaved from '@/components/MoneySaved'
import CrisisModal from '@/components/CrisisModal'
import CravingModal from '@/components/CravingModal'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/types'
import { AchievementProgress, getNextAchievement, getElapsedDays, getMoneySaved } from '@/lib/achievements'
import LevelBadge from '@/components/LevelBadge'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

interface Props {
  profile: UserProfile
  userId: string
  recentAchievements: AchievementProgress[]
  locale: string
  longestStreak: number
  diaryCount: number
  crisesUsed: number
}

export default function DashboardClient({ profile, userId, recentAchievements, locale, longestStreak, diaryCount, crisesUsed }: Props) {
  const t = useTranslations('dashboard')
  const ta = useTranslations('achievements')
  const router = useRouter()

  const [showCrisis, setShowCrisis] = useState(false)
  const [showCraving, setShowCraving] = useState(false)
  const [showRelapse, setShowRelapse] = useState(false)
  const [relapseNotes, setRelapseNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const daysClean = getElapsedDays(profile.quit_date)
  const moneySaved = getMoneySaved(profile.quit_date, profile.daily_cost)
  const currencySymbol = profile.currency === 'EUR' ? '€' : profile.currency === 'USD' ? '$' : profile.currency === 'GBP' ? '£' : profile.currency

  // Milestone celebration: show toast + confetti when a clean-day milestone is hit
  const CLEAN_MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365]
  useEffect(() => {
    if (!CLEAN_MILESTONES.includes(daysClean)) return
    const key = `milestone-${daysClean}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch { return }
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ['#16a34a', '#4ade80', '#f0fdf4'] })
    toast.success(t('milestoneTitle'), {
      description: t('milestoneText', { days: daysClean }),
      duration: 5000,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysClean])

  async function handleShare() {
    const text = t('shareProgressText', {
      days: daysClean,
      amount: `${currencySymbol}${Math.max(0, moneySaved).toFixed(0)}`,
    })
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch (_) { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  const dateLocale = locale === 'es' ? es : enUS
  const quitDateFormatted = format(new Date(profile.quit_date), 'PPP', { locale: dateLocale })

  const greeting = profile.display_name
    ? t('greeting', { name: profile.display_name })
    : t('greetingGeneric')

  // Daily motivational quote (changes each day based on date)
  const rawQuotes = t.raw('quotes')
  const quotes = Array.isArray(rawQuotes) ? rawQuotes as string[] : []
  const dailyQuote = useMemo(() => {
    if (!quotes.length) return ''
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    return quotes[dayOfYear % quotes.length]
  }, [quotes])

  const nextAch = getNextAchievement(
    profile,
    Array.from({ length: diaryCount }, (_, i) => ({ id: String(i) })),
    [],
    crisesUsed
  )

  async function handleRelapse() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('relapses').insert({
      user_id: userId,
      notes: relapseNotes || null,
      previous_quit_date: profile.quit_date,
    })
    await supabase.from('user_profiles').update({
      quit_date: new Date().toISOString(),
    }).eq('id', userId)

    setShowRelapse(false)
    setRelapseNotes('')
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting} 👋</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('cleanSince')} {quitDateFormatted}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <LevelBadge daysClean={daysClean} />
            <button
              onClick={handleShare}
              className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center gap-1"
            >
              🔗 {t('shareProgress')}
            </button>
          </div>
        </div>
      </div>

      {/* Live counter */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
          {t('timeClean')}
        </p>
        <LiveCounter quitDate={profile.quit_date} />
      </div>

      {/* Longest streak badge */}
      {longestStreak > 0 && (
        <div className="mb-4 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl px-4 py-2.5">
          <span className="text-lg" aria-hidden="true">🔥</span>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t('longestStreak')}: <strong>{longestStreak} {longestStreak === 1 ? t('day') : t('days')}</strong>
          </p>
        </div>
      )}

      {/* Money saved */}
      <div className="mb-4">
        <MoneySaved
          quitDate={profile.quit_date}
          dailyCost={profile.daily_cost}
          currency={profile.currency}
          savingsGoal={profile.savings_goal ?? undefined}
        />
      </div>

      {/* Next achievement */}
      {nextAch && (
        <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            {t('nextAchievement')}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">{nextAch.achievement.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {ta(nextAch.achievement.label as any)}
              </p>
              <div className="mt-1.5 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (nextAch.progress / nextAch.total) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily motivational quote */}
      <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/40 rounded-2xl px-4 py-3">
        <p className="text-sm text-green-800 dark:text-green-300 italic text-center">"{dailyQuote}"</p>
      </div>

      {/* Crisis button */}
      <button
        onClick={() => setShowCrisis(true)}
        aria-label={t('crisisButton')}
        className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 font-semibold py-4 rounded-2xl text-sm transition-colors mb-4 flex items-center justify-center gap-2"
      >
        <span className="text-xl" aria-hidden="true">🆘</span>
        {t('crisisButton')}
      </button>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => setShowCraving(true)}
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-left transition-colors"
        >
          <span className="text-2xl block mb-1" aria-hidden="true">⚡</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('logCraving')}</span>
        </button>
        <button
          onClick={() => setShowRelapse(true)}
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-left transition-colors"
        >
          <span className="text-2xl block mb-1" aria-hidden="true">🔄</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('logRelapse')}</span>
        </button>
      </div>

      {/* Recent achievements */}
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
          {t('lastAchievements')}
        </p>
        {recentAchievements.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            {t('noAchievements')}
          </p>
        ) : (
          <div className="space-y-2">
            {recentAchievements.map(({ achievement }) => (
              <div
                key={achievement.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex items-center gap-3 shadow-sm"
              >
                <span className="text-2xl" aria-hidden="true">{achievement.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {ta(achievement.label as any)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {ta(achievement.description as any)}
                  </p>
                </div>
                <span className="ml-auto text-green-500 text-lg">✓</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCrisis && (
        <CrisisModal
          reasons={profile.reasons || []}
          userId={userId}
          onClose={() => setShowCrisis(false)}
        />
      )}

      {showCraving && (
        <CravingModal
          userId={userId}
          onClose={() => { setShowCraving(false); router.refresh() }}
        />
      )}

      {/* Relapse confirm dialog */}
      {showRelapse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t('relapseConfirmTitle')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('relapseConfirmText')}</p>
            <textarea
              value={relapseNotes}
              onChange={(e) => setRelapseNotes(e.target.value)}
              placeholder={t('relapseNotes')}
              rows={3}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 resize-none mb-4 dark:bg-gray-900 dark:text-white"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRelapse(false); setRelapseNotes('') }}
                className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('relapseCancel')}
              </button>
              <button
                onClick={handleRelapse}
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60"
              >
                {loading ? '...' : t('relapseConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
