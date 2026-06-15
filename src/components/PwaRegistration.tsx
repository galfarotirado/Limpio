'use client'

import { useEffect } from 'react'

export default function PwaRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('[SW] Registered', reg.scope)

        // Check for updates every 60 seconds
        setInterval(() => reg.update(), 60_000)
      })
      .catch((err) => console.warn('[SW] Registration failed', err))
  }, [])

  return null
}
