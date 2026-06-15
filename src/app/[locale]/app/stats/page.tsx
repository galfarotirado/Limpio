import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { getElapsedTime, getMoneySaved, getLongestStreak } from '@/lib/achievements'
import HealthTimeline from '@/components/HealthTimeline'

function avg(arr: number[]) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function currencySymbol(c: string) {
  return c === 'EUR' ? '€' : c === 'USD' ? '$' : c === 'GBP' ? '£' : c
}

/** Returns YYYY-MM-DD in user local time (not UTC) */
function toLocalDate(isoString: string): string {
  const d = new Date(isoString)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default async function StatsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const t = await getTranslations('stats')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)

  const [
    { data: profile },
    { data: diary },
    { data: cravings },
    { data: relapses },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase.from('diary_entries').select('mood, created_at').eq('user_id', user.id).order('created_at', { ascending: true }),
    supabase.from('cravings').select('resisted, created_at').eq('user_id', user.id),
    supabase.from('relapses').select('id, created_at').eq('user_id', user.id),
  ])

  if (!profile) redirect(`/${locale}/auth/onboarding`)

  const elapsed = getElapsedTime(profile.quit_date)
  const saved = getMoneySaved(profile.quit_date, profile.daily_cost)
  const cs = currencySymbol(profile.currency)

  const cravingsArr = cravings || []
  const resistedCount = cravingsArr.filter(c => c.resisted).length
  const moods = (diary || []).map(d => d.mood).filter(Boolean) as number[]
  const moodAvg = moods.length ? avg(moods).toFixed(1) : '—'

  // Longest streak
  const relapseDateStrings = (relapses || []).map(r => toLocalDate(r.created_at))
  const longestStreak = getLongestStreak(profile.quit_date, relapseDateStrings)

  const stats = [
    { label: t('totalDays'), value: elapsed.days.toString(), icon: '📅' },
    { label: t('longestStreak'), value: `${longestStreak}d`, icon: '🔥' },
    { label: t('totalSaved'), value: `${cs}${saved.toFixed(2)}`, icon: '💶' },
    { label: t('cravingsTotal'), value: cravingsArr.length.toString(), icon: '⚡' },
    { label: t('cravingsResisted'), value: resistedCount.toString(), icon: '💪' },
    { label: t('diaryEntries'), value: (diary || []).length.toString(), icon: '📖' },
    { label: t('relapses'), value: (relapses || []).length.toString(), icon: '🔄' },
    { label: t('moodAverage'), value: moodAvg, icon: '😊' },
  ]

  // Generate calendar heatmap (last 90 days) using LOCAL dates
  const todayLocal = toLocalDate(new Date().toISOString())
  const quitLocal = toLocalDate(profile.quit_date)
  const relapseDateSet = new Set(relapseDateStrings)

  const days: { date: string; status: 'clean' | 'relapse' | 'before' }[] = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = toLocalDate(d.toISOString())

    if (ds < quitLocal) {
      days.push({ date: ds, status: 'before' })
    } else if (relapseDateSet.has(ds)) {
      days.push({ date: ds, status: 'relapse' })
    } else {
      days.push({ date: ds, status: 'clean' })
    }
  }

  // Mood chart data (last 30 diary entries)
  const moodData = (diary || [])
    .filter(d => d.mood !== null)
    .slice(-30)
    .map(d => ({
      date: toLocalDate(d.created_at),
      mood: d.mood as number,
    }))

  const MOOD_EMOJIS = ['', '😞', '😕', '😐', '🙂', '😄']

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map(({ label, value, icon }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <span className="text-xl block mb-1" aria-hidden="true">{icon}</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Calendar heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 mb-6">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('calendarTitle')}</p>
        <div className="flex flex-wrap gap-1" aria-label={t('calendarTitle')}>
          {days.map(({ date, status }) => (
            <div
              key={date}
              title={date}
              role="img"
              aria-label={`${date}: ${status}`}
              className={`w-4 h-4 rounded-sm ${
                status === 'clean'
                  ? 'bg-green-400'
                  : status === 'relapse'
                  ? 'bg-red-400'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-3 h-3 rounded-sm bg-green-400" aria-hidden="true" />
            {t('cleanDay')}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-3 h-3 rounded-sm bg-red-400" aria-hidden="true" />
            {t('relapseDay')}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700" aria-hidden="true" />
            {t('beforeQuit')}
          </div>
        </div>
      </div>

      {/* Mood chart */}
      {moodData.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('moodChartTitle')}</p>
          <div className="flex items-end gap-1.5 h-20">
            {moodData.map(({ date, mood }, i) => (
              <div
                key={`${date}-${i}`}
                title={`${date}: ${MOOD_EMOJIS[mood]}`}
                className="flex-1 rounded-t-sm transition-all"
                style={{
                  height: `${(mood / 5) * 100}%`,
                  backgroundColor: mood >= 4 ? '#4ade80' : mood >= 3 ? '#facc15' : '#f87171',
                  minWidth: 4,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span>{moodData[0]?.date}</span>
            <span>{moodData[moodData.length - 1]?.date}</span>
          </div>
          <div className="flex gap-3 mt-3">
            {[
              { color: 'bg-green-400', label: '😄 Bien' },
              { color: 'bg-yellow-400', label: '😐 Normal' },
              { color: 'bg-red-400', label: '😞 Mal' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {moodData.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">{t('noData')}</p>
        </div>
      )}

      {/* Health improvements timeline */}
      <div className="mt-6">
        <HealthTimeline hoursClean={elapsed.totalHours} />
      </div>
    </div>
  )
}
