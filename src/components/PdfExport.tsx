'use client'

import { useTranslations, useLocale } from 'next-intl'
import { UserProfile } from '@/types'
import { getElapsedDays, getMoneySaved, getUserAchievements } from '@/lib/achievements'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

interface DiaryEntry {
  id: string
  created_at: string
  content: string
  mood: number
}

interface Props {
  profile: UserProfile
  userId: string
  diary: DiaryEntry[]
  cravingsResisted: number
  onStart?: () => void
  onDone?: () => void
}

const MOOD_LABELS = ['', '😣', '😔', '😐', '🙂', '😄']

function getCurrencySymbol(currency: string) {
  return currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency
}

export async function generatePdf(profile: UserProfile, diary: DiaryEntry[], cravingsResisted: number, locale: string) {
  // Dynamic import so jspdf doesn't bloat the main bundle
  const jsPDF = (await import('jspdf')).default

  const isES = locale === 'es'
  const dateLocale = isES ? es : enUS
  const currencySymbol = getCurrencySymbol(profile.currency)
  const daysClean = getElapsedDays(profile.quit_date)
  const moneySaved = Math.max(0, getMoneySaved(profile.quit_date, profile.daily_cost))
  const achievements = getUserAchievements(daysClean, diary?.length ?? 0, cravingsResisted, moneySaved)
  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const dateStr = format(new Date(), 'PPP', { locale: dateLocale })
  const quitDateStr = format(new Date(profile.quit_date), 'PPP', { locale: dateLocale })

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const MARGIN = 20
  let y = 0

  // ——— Header gradient band ———
  // Green gradient header (simulated with filled rect + lighter overlay)
  doc.setFillColor(22, 163, 74) // green-600
  doc.rect(0, 0, W, 55, 'F')
  doc.setFillColor(16, 185, 129, 0.3) // teal overlay
  doc.rect(0, 0, W, 55, 'F')

  // App name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.text('Limpio', MARGIN, 22)

  // Tagline
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(220, 252, 231) // green-100
  doc.text(isES ? 'Tu camino hacia la libertad' : 'Your path to freedom', MARGIN, 31)

  // Report title on right side
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(255, 255, 255)
  doc.text(isES ? 'Informe de progreso' : 'Progress Report', W - MARGIN, 22, { align: 'right' })

  // User name + date
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(220, 252, 231)
  if (profile.display_name) {
    doc.text(profile.display_name, W - MARGIN, 30, { align: 'right' })
  }
  doc.text(dateStr, W - MARGIN, 37, { align: 'right' })

  y = 65

  // ——— Stats cards ———
  const stats = [
    { label: isES ? 'Días limpio' : 'Clean days', value: String(daysClean), icon: '🌿' },
    { label: isES ? 'Dinero ahorrado' : 'Money saved', value: `${currencySymbol}${moneySaved.toFixed(2)}`, icon: '💰' },
    { label: isES ? 'Logros' : 'Achievements', value: `${unlockedAchievements.length}/${achievements.length}`, icon: '🏆' },
    { label: isES ? 'Antojos resistidos' : 'Cravings resisted', value: String(cravingsResisted), icon: '💪' },
  ]

  const cardW = (W - MARGIN * 2 - 12) / 4
  stats.forEach((stat, i) => {
    const x = MARGIN + i * (cardW + 4)
    // Card background
    doc.setFillColor(240, 253, 244) // green-50
    doc.roundedRect(x, y, cardW, 30, 3, 3, 'F')
    doc.setDrawColor(187, 247, 208) // green-200
    doc.roundedRect(x, y, cardW, 30, 3, 3, 'S')
    // Value
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(22, 101, 52) // green-800
    doc.text(stat.value, x + cardW / 2, y + 13, { align: 'center' })
    // Label
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(21, 128, 61) // green-700
    doc.text(stat.label, x + cardW / 2, y + 22, { align: 'center' })
  })

  y += 40

  // ——— Clean since strip ———
  doc.setFillColor(249, 250, 251) // gray-50
  doc.roundedRect(MARGIN, y, W - MARGIN * 2, 14, 3, 3, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128) // gray-500
  doc.text(isES ? 'Limpio desde:' : 'Clean since:', MARGIN + 5, y + 9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39) // gray-900
  doc.text(quitDateStr, MARGIN + 40, y + 9)

  y += 22

  // ——— Achievements section ———
  if (unlockedAchievements.length > 0) {
    // Section header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(17, 24, 39)
    doc.text(isES ? '🏆 Mis logros' : '🏆 My achievements', MARGIN, y)
    y += 8

    // Achievement pills in rows
    const pillW = 54
    const pillH = 10
    const cols = 3
    const gap = 4

    unlockedAchievements.slice(0, 9).forEach((ach, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = MARGIN + col * (pillW + gap)
      const py = y + row * (pillH + 3)

      doc.setFillColor(240, 253, 244)
      doc.roundedRect(x, py, pillW, pillH, 2, 2, 'F')
      doc.setDrawColor(187, 247, 208)
      doc.roundedRect(x, py, pillW, pillH, 2, 2, 'S')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(22, 101, 52)
      const label = `${ach.emoji} ${ach.id.replace(/_/g, ' ')}`
      doc.text(label, x + pillW / 2, py + 6.5, { align: 'center' })
    })

    const rows = Math.ceil(Math.min(unlockedAchievements.length, 9) / cols)
    y += rows * (pillH + 3) + 10
  }

  // ——— Diary section ———
  const recentEntries = (diary || []).slice(0, 5)
  if (recentEntries.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(17, 24, 39)
    doc.text(isES ? '📓 Últimas entradas del diario' : '📓 Recent diary entries', MARGIN, y)
    y += 8

    recentEntries.forEach((entry) => {
      if (y > 250) return // stop if near page bottom

      const entryDate = format(new Date(entry.created_at), 'PPP', { locale: dateLocale })
      const mood = MOOD_LABELS[entry.mood] || ''

      // Entry header
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(55, 65, 81) // gray-700
      doc.text(`${mood} ${entryDate}`, MARGIN, y)
      y += 5

      // Entry content (wrapped)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(75, 85, 99) // gray-600
      const maxWidth = W - MARGIN * 2
      const lines = doc.splitTextToSize(entry.content || '', maxWidth)
      const maxLines = 4
      const displayLines = lines.slice(0, maxLines)
      if (lines.length > maxLines) displayLines[maxLines - 1] = displayLines[maxLines - 1] + '…'
      doc.text(displayLines, MARGIN, y)
      y += displayLines.length * 4 + 6

      // Divider
      doc.setDrawColor(229, 231, 235) // gray-200
      doc.line(MARGIN, y, W - MARGIN, y)
      y += 5
    })
  }

  // ——— Footer ———
  doc.setFillColor(22, 163, 74)
  doc.rect(0, 285, W, 12, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(isES ? 'Generado con Limpio · Tu camino hacia la libertad' : 'Generated with Limpio · Your path to freedom', W / 2, 292, { align: 'center' })

  // Save
  const filename = `limpio-progreso-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

export default function PdfExportButton({ profile, userId, diary, cravingsResisted, onStart, onDone }: Props) {
  const t = useTranslations('settings')
  const locale = useLocale()

  async function handleClick() {
    onStart?.()
    try {
      await generatePdf(profile, diary, cravingsResisted, locale)
    } finally {
      onDone?.()
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
    >
      <span>📄</span>
      {t('exportPdfButton')}
    </button>
  )
}
