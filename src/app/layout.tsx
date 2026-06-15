import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Limpio — Tu camino hacia la libertad',
  description: 'Lleva el registro de tu tiempo limpio, ahorra dinero y celebra cada logro.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
