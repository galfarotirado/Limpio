'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: `/${locale}/app`, label: t('dashboard'), icon: '🏠' },
    { href: `/${locale}/app/diary`, label: t('diary'), icon: '📖' },
    { href: `/${locale}/app/achievements`, label: t('achievements'), icon: '🏆' },
    { href: `/${locale}/app/stats`, label: t('stats'), icon: '📊' },
    { href: `/${locale}/app/settings`, label: t('settings'), icon: '⚙️' },
  ]

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/auth/login`)
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        aria-label="Main navigation"
        className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 py-6 px-4 z-30"
      >
        <Link
          href={`/${locale}/app`}
          className="flex items-center gap-2 mb-8 px-2"
          aria-label="Limpio - Home"
        >
          <span className="text-2xl font-bold text-green-600 tracking-tight">Limpio</span>
          <span className="text-xl" aria-hidden="true">🌿</span>
        </Link>

        <ul className="flex flex-col gap-1 flex-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span className="text-base" aria-hidden="true">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-2 px-3 mt-4">
          <ThemeToggle />
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-2 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 flex-1"
          >
            <span aria-hidden="true">🚪</span>
            {t('signOut')}
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-30"
      >
        <ul className="flex justify-around items-center py-2">
          {links.slice(0, 4).map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={link.label}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                    isActive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <span className="text-xl" aria-hidden="true">{link.icon}</span>
                  <span className="text-[10px] font-medium">{link.label}</span>
                </Link>
              </li>
            )
          })}
          <li>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t('settings')}
              aria-expanded={menuOpen}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 dark:text-gray-400"
            >
              <span className="text-xl" aria-hidden="true">⚙️</span>
              <span className="text-[10px] font-medium">{t('settings')}</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div
            className="absolute bottom-16 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 min-w-44"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-700 mb-2">
              <ThemeToggle />
              <span className="text-sm text-gray-600 dark:text-gray-400">Tema</span>
            </div>
            <Link
              href={`/${locale}/app/settings`}
              className="flex items-center gap-2 py-2 text-sm text-gray-700 dark:text-gray-300"
              onClick={() => setMenuOpen(false)}
            >
              ⚙️ {t('settings')}
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-2 py-2 text-sm text-gray-700 dark:text-gray-300 w-full"
            >
              🚪 {t('signOut')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
