import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit: 3 attempts per hour per user
  const { allowed } = rateLimit(`delete-account:${user.id}`, { limit: 3, windowMs: 60 * 60 * 1000 })
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Delete user data first (respects RLS)
  await supabase.from('diary_entries').delete().eq('user_id', user.id)
  await supabase.from('cravings').delete().eq('user_id', user.id)
  await supabase.from('relapses').delete().eq('user_id', user.id)
  await supabase.from('user_profiles').delete().eq('id', user.id)

  // Delete auth user with service role key (server-side only)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceRoleKey) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    await admin.auth.admin.deleteUser(user.id)
  }

  return NextResponse.json({ success: true })
}
