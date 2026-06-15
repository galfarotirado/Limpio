'use client'

import dynamic from 'next/dynamic'
import InstallPrompt from './InstallPrompt'

// Toaster uses browser APIs at module init — load only on client
const Toaster = dynamic(
  () => import('sonner').then(mod => ({ default: mod.Toaster })),
  { ssr: false }
)

export default function AppClientShell() {
  return (
    <>
      <InstallPrompt />
      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white shadow-lg rounded-2xl',
            description: 'text-gray-500 dark:text-gray-400',
          },
        }}
      />
    </>
  )
}
