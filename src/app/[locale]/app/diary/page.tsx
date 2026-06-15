import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DiaryClient from './DiaryClient'

export default async function DiaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)

  const { data: entries } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return <DiaryClient userId={user.id} entries={entries || []} locale={locale} />
}
