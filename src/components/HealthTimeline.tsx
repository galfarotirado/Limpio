'use client'

import { useTranslations } from 'next-intl'

interface Milestone {
  key: string
  hours: number
  icon: string
}

const MILESTONES: Milestone[] = [
  { key: 'h1h',  hours: 1,    icon: '🩸' },
  { key: 'h8h',  hours: 8,    icon: '💨' },
  { key: 'h24h', hours: 24,   icon: '❤️' },
  { key: 'h48h', hours: 48,   icon: '👃' },
  { key: 'h72h', hours: 72,   icon: '🫁' },
  { key: 'h2w',  hours: 336,  icon: '😴' },
  { key: 'h1m',  hours: 720,  icon: '🧠' },
  { key: 'h1y',  hours: 8760, icon: '👑' },
]

interface Props {
  hoursClean: number
}

export default function HealthTimeline({ hoursClean }: Props) {
  const t = useTranslations('health')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('title')}</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{t('subtitle')}</p>

      <div className="space-y-3">
        {MILESTONES.map((m) => {
          const achieved = hoursClean >= m.hours
          const inProgress = !achieved && hoursClean >= m.hours * 0.5
          const progress = Math.min(100, (hoursClean / m.hours) * 100)

          return (
            <div key={m.key} className="flex items-start gap-3">
              <span className={`text-lg flex-shrink-0 mt-0.5 ${achieved ? '' : 'opacity-30'}`}>
                {m.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-xs font-medium ${
                    achieved ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {t(m.key as any)}
                  </p>
                  <span className={`text-xs ml-2 flex-shrink-0 font-semibold ${
                    achieved
                      ? 'text-green-600 dark:text-green-400'
                      : inProgress
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                  }`}>
                    {achieved ? `✓ ${t('achieved')}` : inProgress ? t('inProgress') : t('pending')}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      achieved ? 'bg-green-500' : inProgress ? 'bg-amber-400' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
