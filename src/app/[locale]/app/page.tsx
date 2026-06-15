import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { computeAchievements, getLongestStreak } from '@/lib/achievements'
import DashboardClient from './DashboardClient'

function toLocalDate(isoString: string): string {
  const d = new Date(isoString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)

  const [
    { data: profile },
    { data: diaryEntries },
    { data: cravings },
    { data: relapses },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase.from('diary_entries').select('id, created_at').eq('user_id', user.id),
    supabase.from('cravings').select('*').eq('user_id', user.id),
    supabase.from('relapses').select('created_at').eq('user_id', user.id).order('created_at'),
  ])

  if (!profile) redirect(`/${locale}/auth/onboarding`)

  const crisesUsed = (cravings || []).filter(c => c.trigger_text === 'crisis_button').length
  const achievements = computeAchievements(profile, diaryEntries || [], cravings || [], crisesUsed)
  const recentUnlocked = achievements.filter(a => a.unlocked).slice(-3).reverse()

  const relapseDateStrings = (relapses || []).map(r => toLocalDate(r.created_at))
  const longestStreak = getLongestStreak(profile.quit_date, relapseDateStrings)

  return (
    <DashboardClient
      profile={profile}
      userId={user.id}
      recentAchievements={recentUnlocked}
      locale={locale}
      longestStreak={longestStreak}
      diaryCount={diaryEntries?.length ?? 0}
      crisesUsed={crisesUsed}
    />
  )
}
