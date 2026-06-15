import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type { Metadata, Viewport } from 'next'
import { locales } from '@/i18n'
import PwaRegistration from '@/components/PwaRegistration'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: { default: 'Limpio 🌿', template: '%s | Limpio' },
  description: 'Deja el cannabis con Limpio. Registra tu tiempo limpio, calcula tu ahorro y desbloquea logros. Gratis, sin anuncios.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Limpio',
    startupImage: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Limpio 🌿',
    description: 'Tu camino hacia la libertad. Registra tu tiempo limpio, ahorra dinero y celebra cada logro.',
    type: 'website',
    siteName: 'Limpio',
    locale: 'es_ES',
    alternateLocale: ['en_GB'],
  },
  twitter: {
    card: 'summary',
    title: 'Limpio 🌿',
    description: 'Tu camino hacia la libertad.',
  },
  alternates: {
    canonical: 'https://limpio.app',
    languages: { es: 'https://limpio.app/es', en: 'https://limpio.app/en' },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// Anti-flash script for dark mode — runs before React hydration
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('limpio-theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Limpio" />
        <meta name="msapplication-TileImage" content="/icon-144.png" />
        <meta name="msapplication-TileColor" content="#16a34a" />
      </head>
      <body className="h-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Limpio',
              description: 'App para dejar el cannabis. Seguimiento de tiempo limpio, ahorro y logros.',
              applicationCategory: 'HealthApplication',
              operatingSystem: 'Web, Android, iOS',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
              url: 'https://limpio.app',
            }),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <PwaRegistration />
      </body>
    </html>
  )
}
