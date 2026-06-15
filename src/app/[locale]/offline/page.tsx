'use client'

import { useTranslations } from 'next-intl'

export default function OfflinePage() {
  const t = useTranslations('offline')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🌿</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('message')}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
        >
          {t('retry')}
        </button>
      </div>
    </div>
  )
}
