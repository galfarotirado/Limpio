'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const t = useTranslations('auth')
  const locale = useLocale()

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/api/auth/callback?next=/${locale}/auth/update-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (error) {
      setError(t('resetError'))
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="text-2xl font-bold text-green-600 tracking-tight">
            Limpio 🌿
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">{t('resetTitle')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('resetSubtitle')}</p>
        </div>

        {sent ? (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">📧</div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">{t('resetSent')}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{t('resetSentDetail')}</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
            >
              {loading ? '...' : t('resetButton')}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          <Link href={`/${locale}/auth/login`} className="text-green-600 font-medium hover:underline">
            ← {t('backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  )
}
