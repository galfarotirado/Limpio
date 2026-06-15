import Navbar from '@/components/Navbar'
import AppClientShell from '@/components/AppClientShell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/auth/login`)
  }

  // Check if onboarding is complete
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect(`/${locale}/auth/onboarding`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-green-700 focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:font-semibold"
      >
        {t('skipLink')}
      </a>
      <Navbar />
      {/* Desktop: offset left for sidebar, Mobile: offset bottom for nav */}
      <main id="main-content" className="md:ml-56 pb-20 md:pb-8">
        {children}
      </main>
      <AppClientShell />
    </div>
  )
}
