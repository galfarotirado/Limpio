'use client'

import { Toaster } from 'sonner'

export default function SonnerToaster() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white shadow-lg rounded-2xl',
          description: 'text-gray-500 dark:text-gray-400',
        },
      }}
    />
  )
}
