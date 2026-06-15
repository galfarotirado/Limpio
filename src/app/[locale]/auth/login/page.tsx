'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(t('loginError'))
      setLoading(false)
      return
    }

    router.push(`/${locale}/app`)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="text-2xl font-bold text-green-600 tracking-tight">
            Limpio 🌿
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">{t('loginTitle')}</h1>
        </div>

        <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
          {error && (
            <div role="alert" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-xl">
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
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              required
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? '...' : t('login')}
          </button>

          <div className="text-center">
            <Link
              href={`/${locale}/auth/reset-password`}
              className="text-xs text-gray-400 hover:text-green-600 transition-colors"
            >
              {t('forgotPassword')}
            </Link>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          {t('noAccount')}{' '}
          <Link href={`/${locale}/auth/signup`} className="text-green-600 font-medium hover:underline">
            {t('signup')}
          </Link>
        </p>
      </div>
    </div>
  )
}
