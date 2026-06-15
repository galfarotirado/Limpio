import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { computeAchievements } from '@/lib/achievements'
import AchievementsClient from './AchievementsClient'

export default async function AchievementsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)

  const [
    { data: profile },
    { data: diaryEntries },
    { data: cravings },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase.from('diary_entries').select('id, created_at').eq('user_id', user.id),
    supabase.from('cravings').select('*').eq('user_id', user.id),
  ])

  if (!profile) redirect(`/${locale}/auth/onboarding`)

  const crisesUsed = (cravings || []).filter(c => c.trigger_text === 'crisis_button').length
  const achievements = computeAchievements(profile, diaryEntries || [], cravings || [], crisesUsed)
  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <AchievementsClient
      achievements={achievements}
      unlockedCount={unlockedCount}
      total={achievements.length}
    />
  )
}
