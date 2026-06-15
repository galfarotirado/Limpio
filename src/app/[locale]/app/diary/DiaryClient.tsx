'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { DiaryEntry } from '@/types'
import { toast } from 'sonner'

const MOODS = ['😞', '😕', '😐', '🙂', '😄']

interface Props {
  userId: string
  entries: DiaryEntry[]
  locale: string
}

export default function DiaryClient({ userId, entries, locale }: Props) {
  const t = useTranslations('diary')
  const tc = useTranslations('common')
  const router = useRouter()

  const dateLocale = locale === 'es' ? es : enUS

  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null)
  const [search, setSearch] = useState('')
  const [filterMood, setFilterMood] = useState<number | null>(null)

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch = !search || e.content.toLowerCase().includes(search.toLowerCase())
      const matchesMood = filterMood === null || e.mood === filterMood
      return matchesSearch && matchesMood
    })
  }, [entries, search, filterMood])

  async function saveEntry() {
    if (!content.trim()) return
    setSaving(true)
    const supabase = createClient()
    const wasEditing = !!editingEntry

    if (editingEntry) {
      await supabase
        .from('diary_entries')
        .update({ content: content.trim(), mood })
        .eq('id', editingEntry.id)
    } else {
      await supabase.from('diary_entries').insert({
        user_id: userId,
        content: content.trim(),
        mood,
      })
    }

    setContent('')
    setMood(null)
    setShowForm(false)
    setEditingEntry(null)
    setSaving(false)
    toast.success(wasEditing ? t('entryUpdated') : t('entrySaved'))
    router.refresh()
  }

  function startEdit(entry: DiaryEntry) {
    setEditingEntry(entry)
    setContent(entry.content)
    setMood(entry.mood)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setShowForm(false)
    setContent('')
    setMood(null)
    setEditingEntry(null)
  }

  async function deleteEntry(id: string) {
    const supabase = createClient()
    await supabase.from('diary_entries').delete().eq('id', id)
    setToDelete(null)
    toast.success(t('entryDeleted'))
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            + {t('newEntry')}
          </button>
        )}
      </div>

      {/* Search + Mood filter */}
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="flex-1 min-w-40 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400 bg-white dark:bg-gray-800 dark:text-white"
          />
          <div className="flex gap-1 items-center flex-wrap">
            <button
              onClick={() => setFilterMood(null)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterMood === null
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {tc('all')}
            </button>
            {MOODS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => setFilterMood(filterMood === i + 1 ? null : i + 1)}
                title={t(`mood${i + 1}` as any)}
                className={`text-lg px-2 py-1.5 rounded-lg transition-all ${
                  filterMood === i + 1 ? 'ring-2 ring-green-400 bg-green-50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* New/Edit entry form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 mb-6 animate-slide-up">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {editingEntry ? t('editEntry') : t('howAreYou')}
          </p>

          <div className="flex gap-3 mb-4">
            {MOODS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => setMood(mood === i + 1 ? null : i + 1)}
                title={t(`mood${i + 1}` as any)}
                aria-pressed={mood === i + 1}
                className={`text-2xl transition-transform ${
                  mood === i + 1 ? 'scale-125' : 'opacity-50 hover:opacity-80'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 500))}
            placeholder={t('writePlaceholder')}
            rows={5}
            maxLength={500}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 resize-none bg-white dark:bg-gray-900 dark:text-white"
          />
          <p className={`text-xs mt-1 text-right ${content.length >= 480 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
            {t('charCount', { count: content.length })}
          </p>

          <div className="flex gap-3 mt-3">
            <button
              onClick={cancelForm}
              className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {tc('cancel')}
            </button>
            <button
              onClick={saveEntry}
              disabled={saving || !content.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50 transition-colors"
            >
              {saving ? '...' : t('saveEntry')}
            </button>
          </div>
        </div>
      )}

      {/* Entries list */}
      {filteredEntries.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📖</div>
          {search || filterMood !== null ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noResults')}</p>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('emptyTitle')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('emptySubtitle')}</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                ✏️ {t('writeFirst')}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {entry.mood && (
                    <span className="text-xl" aria-label={t(`mood${entry.mood}` as any)}>
                      {MOODS[entry.mood - 1]}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 font-medium">
                    {format(new Date(entry.created_at), 'PPP · p', { locale: dateLocale })}
                  </span>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(entry)}
                    aria-label={tc('edit')}
                    className="text-gray-300 hover:text-green-500 text-base transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setToDelete(entry.id)}
                    aria-label={tc('delete')}
                    className="text-gray-300 hover:text-red-400 text-base transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {toDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 max-w-xs w-full text-center shadow-xl">
            <p className="font-semibold text-gray-900 dark:text-white mb-4">{t('deleteEntry')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setToDelete(null)}
                className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 py-2.5 rounded-xl text-sm"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={() => deleteEntry(toDelete)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold"
              >
                {t('deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
