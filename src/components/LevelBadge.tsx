'use client'

import { useTranslations } from 'next-intl'

interface Props {
  daysClean: number
}

interface Level {
  key: string
  minDays: number
  maxDays: number
  emoji: string
  color: string
}

const LEVELS: Level[] = [
  { key: 'novice',     minDays: 0,   maxDays: 6,   emoji: '🌱', color: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700' },
  { key: 'apprentice', minDays: 7,   maxDays: 29,  emoji: '🌿', color: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30' },
  { key: 'warrior',    minDays: 30,  maxDays: 89,  emoji: '⚡', color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' },
  { key: 'master',     minDays: 90,  maxDays: 364, emoji: '🔥', color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30' },
  { key: 'free',       minDays: 365, maxDays: Infinity, emoji: '👑', color: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' },
]

export function getLevel(daysClean: number): Level {
  return LEVELS.slice().reverse().find(l => daysClean >= l.minDays) ?? LEVELS[0]
}

export default function LevelBadge({ daysClean }: Props) {
  const t = useTranslations('levels')
  const level = getLevel(daysClean)
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1]
  const daysToNext = nextLevel ? nextLevel.minDays - daysClean : null

  return (
    <div className={`inline-flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl ${level.color}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-lg">{level.emoji}</span>
        <span className="text-sm font-bold">{t(level.key as any)}</span>
      </div>
      {daysToNext !== null && (
        <p className="text-xs opacity-70">{t('daysToNext', { days: daysToNext })}</p>
      )}
    </div>
  )
}
