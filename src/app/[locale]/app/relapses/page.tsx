import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

export default async function RelapsesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const t = await getTranslations('settings')
  const tc = await getTranslations('common')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)

  const { data: relapses } = await supabase
    .from('relapses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const dateLocale = locale === 'es' ? es : enUS

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/${locale}/app/settings`}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
          aria-label={tc('back')}
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('relapseHistory')}</h1>
      </div>

      {!relapses || relapses.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🌿</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {locale === 'es' ? 'Sin recaídas registradas. ¡Sigue así!' : 'No relapses recorded. Keep it up!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {relapses.map((relapse) => (
            <div
              key={relapse.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">🔄</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {format(new Date(relapse.created_at), 'PPP · p', { locale: dateLocale })}
                  </span>
                </div>
              </div>
              {relapse.previous_quit_date && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {locale === 'es' ? 'Racha anterior: ' : 'Previous streak: '}
                  {format(new Date(relapse.previous_quit_date), 'PPP', { locale: dateLocale })}
                </p>
              )}
              {relapse.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 italic">
                  "{relapse.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
