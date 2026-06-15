'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AppError({ error, reset }: Props) {
  const locale = useLocale()

  useEffect(() => {
    console.error('[Limpio Error]', error)
  }, [error])

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">🌿</div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Algo salió mal
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        No te preocupes, tu progreso está guardado. Intenta de nuevo.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          Intentar de nuevo
        </button>
        <Link
          href={`/${locale}/app`}
          className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
