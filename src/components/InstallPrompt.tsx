'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const t = useTranslations('pwa')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Don't show if user dismissed before
    if (localStorage.getItem('pwa-install-dismissed')) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible || !deferredPrompt) return null

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDeferredPrompt(null)
  }

  function handleDismiss() {
    localStorage.setItem('pwa-install-dismissed', '1')
    setVisible(false)
  }

  return (
    <div className="md:hidden fixed bottom-20 left-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 flex items-start gap-3">
        <img src="/icon-72.png" alt="Limpio" className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">{t('installTitle')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('installSubtitle')}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
            >
              {t('install')}
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-400 hover:text-gray-600 px-2"
            >
              {t('notNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
