import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('landing')
  const tc = await getTranslations('common')

  const features = [
    { icon: '⏱️', title: t('feature1Title'), desc: t('feature1Desc') },
    { icon: '💶', title: t('feature2Title'), desc: t('feature2Desc') },
    { icon: '📖', title: t('feature3Title'), desc: t('feature3Desc') },
    { icon: '🏆', title: t('feature4Title'), desc: t('feature4Desc') },
    { icon: '🆘', title: t('feature5Title'), desc: t('feature5Desc') },
    { icon: '📊', title: t('feature6Title'), desc: t('feature6Desc') },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <header className="flex items-center justify-between max-w-5xl mx-auto px-6 py-5">
        <span className="text-2xl font-bold text-green-600 tracking-tight flex items-center gap-2">
          Limpio 🌿
        </span>
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/auth/login`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2"
          >
            {t('login')}
          </Link>
          <Link
            href={`/${locale}/auth/signup`}
            className="text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-colors"
          >
            {t('cta')}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span>🌿</span> {tc('tagline')}
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
          {t('hero')}
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
          {t('heroSub')}
        </p>
        <Link
          href={`/${locale}/auth/signup`}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-colors shadow-sm"
        >
          {t('cta')} →
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-gray-50 rounded-2xl p-6 hover:bg-green-50 transition-colors"
            >
              <span className="text-3xl mb-3 block">{f.icon}</span>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="bg-green-600 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">El primer día es hoy.</h2>
        <p className="text-green-100 mb-8">Gratis, sin anuncios, sin trampa.</p>
        <Link
          href={`/${locale}/auth/signup`}
          className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-green-50 transition-colors"
        >
          {t('cta')} →
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400">
        Limpio · Hecho con 💚 para todos los que quieren estar bien
      </footer>
    </main>
  )
}
