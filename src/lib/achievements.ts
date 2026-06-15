import { Achievement, UserProfile, DiaryEntry, Craving } from '@/types'

export const ACHIEVEMENTS: Achievement[] = [
  // Time-based
  { id: 'time_1h',  label: 'time_1h',  description: 'time_1h_desc',  icon: '⏰', category: 'time', threshold: 1 },
  { id: 'time_24h', label: 'time_24h', description: 'time_24h_desc', icon: '🌅', category: 'time', threshold: 24 },
  { id: 'time_3d',  label: 'time_3d',  description: 'time_3d_desc',  icon: '🌿', category: 'time', threshold: 72 },
  { id: 'time_1w',  label: 'time_1w',  description: 'time_1w_desc',  icon: '🗓️', category: 'time', threshold: 168 },
  { id: 'time_2w',  label: 'time_2w',  description: 'time_2w_desc',  icon: '💪', category: 'time', threshold: 336 },
  { id: 'time_1m',  label: 'time_1m',  description: 'time_1m_desc',  icon: '🏆', category: 'time', threshold: 720 },
  { id: 'time_3m',  label: 'time_3m',  description: 'time_3m_desc',  icon: '🦋', category: 'time', threshold: 2160 },
  { id: 'time_6m',  label: 'time_6m',  description: 'time_6m_desc',  icon: '⭐', category: 'time', threshold: 4320 },
  { id: 'time_1y',  label: 'time_1y',  description: 'time_1y_desc',  icon: '👑', category: 'time', threshold: 8760 },
  // Diary-based
  { id: 'diary_1',  label: 'diary_1',  description: 'diary_1_desc',  icon: '📖', category: 'diary', threshold: 1 },
  { id: 'diary_7',  label: 'diary_7',  description: 'diary_7_desc',  icon: '✍️', category: 'diary', threshold: 7 },
  { id: 'diary_30', label: 'diary_30', description: 'diary_30_desc', icon: '📚', category: 'diary', threshold: 30 },
  // Crisis
  { id: 'crisis_survived', label: 'crisis_survived', description: 'crisis_survived_desc', icon: '🛡️', category: 'crisis', threshold: 1 },
  // Savings
  { id: 'savings_10',  label: 'savings_10',  description: 'savings_10_desc',  icon: '💶', category: 'savings', threshold: 10 },
  { id: 'savings_50',  label: 'savings_50',  description: 'savings_50_desc',  icon: '💰', category: 'savings', threshold: 50 },
  { id: 'savings_100', label: 'savings_100', description: 'savings_100_desc', icon: '🎉', category: 'savings', threshold: 100 },
]

export interface AchievementProgress {
  achievement: Achievement
  unlocked: boolean
  unlockedAt?: string
}

export function computeAchievements(
  profile: UserProfile,
  diaryEntries: DiaryEntry[],
  cravings: Craving[],
  crisesUsed: number,
  savedUnlockData?: Record<string, string> // achievementId -> unlockedAt ISO string
): AchievementProgress[] {
  const now = new Date()
  const quitDate = new Date(profile.quit_date)
  const hoursClean = Math.max(0, (now.getTime() - quitDate.getTime()) / (1000 * 60 * 60))
  const moneySaved = hoursClean / 24 * profile.daily_cost

  return ACHIEVEMENTS.map((achievement) => {
    let unlocked = false

    switch (achievement.category) {
      case 'time':
        unlocked = hoursClean >= achievement.threshold
        break
      case 'diary':
        unlocked = diaryEntries.length >= achievement.threshold
        break
      case 'crisis':
        unlocked = crisesUsed >= achievement.threshold
        break
      case 'savings':
        unlocked = moneySaved >= achievement.threshold
        break
    }

    return {
      achievement,
      unlocked,
      unlockedAt: savedUnlockData?.[achievement.id],
    }
  })
}

export function getElapsedTime(quitDate: string): {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalHours: number
} {
  const now = new Date()
  const quit = new Date(quitDate)
  const diff = Math.max(0, now.getTime() - quit.getTime())

  const totalSeconds = Math.floor(diff / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const days = Math.floor(totalHours / 24)

  return { days, hours, minutes, seconds, totalHours }
}

export function getElapsedDays(quitDate: string): number {
  return getElapsedTime(quitDate).days
}

export function getMoneySaved(quitDate: string, dailyCost: number): number {
  const { totalHours } = getElapsedTime(quitDate)
  return (totalHours / 24) * dailyCost
}

/**
 * Compute longest streak in days given an array of relapse dates (ISO date strings like "2024-03-01")
 * and the original quit date.
 */
export function getLongestStreak(quitDate: string, relapseDates: string[]): number {
  if (relapseDates.length === 0) {
    return getElapsedTime(quitDate).days
  }

  // Deduplicate relapses that happened on the same day
  const uniqueDates = [...new Set(relapseDates.map(d => d.split('T')[0]))]
  const sorted = uniqueDates.sort()
  let longest = 0

  // From quit date to first relapse
  const quit = new Date(quitDate)
  const first = new Date(sorted[0])
  const firstGap = Math.floor((first.getTime() - quit.getTime()) / (1000 * 60 * 60 * 24))
  if (firstGap > longest) longest = firstGap

  // Between consecutive relapses
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const gap = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
    if (gap > longest) longest = gap
  }

  // From last relapse to now
  const last = new Date(sorted[sorted.length - 1])
  const now = new Date()
  const tail = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  if (tail > longest) longest = tail

  return Math.max(0, longest)
}

/**
 * Returns the next locked achievement (the one closest to being unlocked).
 */
export function getNextAchievement(
  profile: UserProfile,
  diaryEntries: { id: string }[],
  cravings: { trigger_text: string | null }[],
  crisesUsed: number
): { achievement: Achievement; progress: number; total: number } | null {
  const now = new Date()
  const quitDate = new Date(profile.quit_date)
  const hoursClean = Math.max(0, (now.getTime() - quitDate.getTime()) / (1000 * 60 * 60))
  const moneySaved = (hoursClean / 24) * profile.daily_cost

  const candidates = ACHIEVEMENTS.map((achievement) => {
    let progress = 0
    let total = achievement.threshold

    switch (achievement.category) {
      case 'time':
        progress = hoursClean
        total = achievement.threshold
        break
      case 'diary':
        progress = diaryEntries.length
        total = achievement.threshold
        break
      case 'crisis':
        progress = crisesUsed
        total = achievement.threshold
        break
      case 'savings':
        progress = moneySaved
        total = achievement.threshold
        break
    }

    const unlocked = progress >= total
    return { achievement, progress, total, unlocked }
  })

  // Find locked achievements sorted by % completion descending
  // Skip savings achievements if daily_cost is 0 (they're unreachable)
  const locked = candidates
    .filter((c) => !c.unlocked)
    .filter((c) => !(c.achievement.category === 'savings' && profile.daily_cost === 0))
    .sort((a, b) => b.progress / b.total - a.progress / a.total)

  if (locked.length === 0) return null
  const { achievement, progress, total } = locked[0]
  return { achievement, progress, total }
}

export function getUserAchievements(
  daysClean: number,
  diaryCount: number,
  cravingsResisted: number,
  moneySaved: number
): { id: string; emoji: string; unlocked: boolean }[] {
  const hoursClean = daysClean * 24
  return ACHIEVEMENTS.map((ach) => {
    let unlocked = false
    switch (ach.category) {
      case 'time': unlocked = hoursClean >= ach.threshold; break
      case 'diary': unlocked = diaryCount >= ach.threshold; break
      case 'crisis': unlocked = cravingsResisted >= ach.threshold; break
      case 'savings': unlocked = moneySaved >= ach.threshold; break
    }
    return { id: ach.id, emoji: ach.icon, unlocked }
  })
}
