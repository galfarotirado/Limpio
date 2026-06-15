'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/types'
import { toast } from 'sonner'
import { generatePdf } from '@/components/PdfExport'
import { z } from 'zod'

const settingsSchema = z.object({
  display_name: z.string().max(50).optional().nullable(),
  quit_date: z.string().min(1),
  daily_cost: z.number().min(0).max(10000),
  currency: z.enum(['EUR', 'USD', 'GBP', 'MXN', 'COP']),
  language: z.enum(['es', 'en']),
  reasons: z.array(z.string().max(200).trim()).max(20),
  savings_goal: z.number().min(0).max(1000000).nullable(),
})

interface Props {
  profile: UserProfile
  userId: string
  locale: string
}

export default function SettingsClient({ profile, userId, locale }: Props) {
  const t = useTranslations('settings')
  const router = useRouter()

  const [name, setName] = useState(profile.display_name || '')
  const [quitDate, setQuitDate] = useState(profile.quit_date.split('T')[0])
  const [dailyCost, setDailyCost] = useState(profile.daily_cost.toString())
  const [currency, setCurrency] = useState(profile.currency)
  const [language, setLanguage] = useState(profile.language)
  const [savingsGoal, setSavingsGoal] = useState(profile.savings_goal?.toString() || '')
  const [reasonInput, setReasonInput] = useState('')
  const [reasons, setReasons] = useState<string[]>(profile.reasons || [])
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [exporting, setExporting] = useState(false)

  function addReason(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && reasonInput.trim()) {
      e.preventDefault()
      setReasons((prev) => [...prev, reasonInput.trim()])
      setReasonInput('')
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    // Validate and sanitize before saving
    const parsed = settingsSchema.safeParse({
      display_name: name || null,
      quit_date: quitDate,
      daily_cost: parseFloat(dailyCost) || 0,
      currency,
      language,
      reasons: reasons.map(r => r.trim()).filter(Boolean),
      savings_goal: savingsGoal ? parseFloat(savingsGoal) : null,
    })

    if (!parsed.success) {
      setSaving(false)
      toast.error('Datos inválidos')
      return
    }

    const supabase = createClient()
    await supabase.from('user_profiles').update({
      display_name: parsed.data.display_name,
      quit_date: new Date(parsed.data.quit_date + 'T00:00:00').toISOString(),
      daily_cost: parsed.data.daily_cost,
      currency: parsed.data.currency,
      language: parsed.data.language,
      reasons: parsed.data.reasons,
      savings_goal: parsed.data.savings_goal,
    }).eq('id', userId)

    setSaving(false)
    toast.success(t('changesSaved'))

    if (language !== locale) {
      router.push(`/${language}/app/settings`)
    } else {
      router.refresh()
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const supabase = createClient()
      const [{ data: diary }, { data: cravings }] = await Promise.all([
        supabase.from('diary_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('cravings').select('id, resisted').eq('user_id', userId).eq('resisted', true),
      ])

      const cravingsResisted = cravings?.length ?? 0
      await generatePdf(profile, diary ?? [], cravingsResisted, locale)
    } finally {
      setExporting(false)
    }
  }

  async function handleDelete() {
    const res = await fetch('/api/delete-account', { method: 'DELETE' })
    if (!res.ok) return
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}`)
  }

  const inputCls = 'w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-white dark:bg-gray-900 dark:text-white dark:placeholder-gray-500'
  const selectCls = 'border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 bg-white dark:bg-gray-900 dark:text-white'
  const labelCls = 'block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('profile')}</h2>

          <div>
            <label className={labelCls}>{t('displayName')}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>{t('quitDate')}</label>
            <input
              type="date"
              value={quitDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setQuitDate(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelCls}>{t('dailyCost')}</label>
              <input
                type="number"
                value={dailyCost}
                onChange={(e) => setDailyCost(e.target.value)}
                min="0"
                step="0.5"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t('currency')}</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectCls}>
                <option value="EUR">EUR €</option>
                <option value="USD">USD $</option>
                <option value="GBP">GBP £</option>
                <option value="MXN">MXN $</option>
                <option value="COP">COP $</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>{t('language')}</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={`${selectCls} w-full`}>
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>{t('savingsGoal')}</label>
            <input
              type="number"
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(e.target.value)}
              min="0"
              step="10"
              placeholder={t('savingsGoalPlaceholder')}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>{t('reasons')}</label>
            <input
              type="text"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              onKeyDown={addReason}
              placeholder="Escribe y pulsa Enter..."
              className={inputCls}
            />
            {reasons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {reasons.map((r, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-3 py-1.5 rounded-full">
                    {r}
                    <button type="button" onClick={() => setReasons(prev => prev.filter((_, idx) => idx !== i))} className="text-green-400 hover:text-green-600 ml-1">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          {saving ? '...' : t('saveChanges')}
        </button>
      </form>

      {/* Export data */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('exportData')}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('exportDataDesc')}</p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-60"
        >
          {exporting ? t('downloadingPdf') : `📄 ${t('exportPdfButton')}`}
        </button>
      </div>

      {/* Relapse history link */}
      <div className="mt-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <Link
          href={`/${locale}/app/relapses`}
          className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 flex items-center gap-2"
        >
          🔄 {t('relapseHistory')} →
        </Link>
      </div>

      {/* Danger zone */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/50 p-5">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">{t('dangerZone')}</h2>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
          >
            {t('deleteAccount')}
          </button>
        ) : (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('deleteAccountConfirm')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 py-2.5 rounded-xl text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold"
              >
                {t('deleteAccount')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
