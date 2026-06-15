import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🌿</div>
        <h1 className="text-6xl font-bold text-green-600 dark:text-green-400 mb-4">404</h1>
        <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('title')}</p>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{t('message')}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
        >
          {t('back')}
        </Link>
      </div>
    </div>
  )
}
