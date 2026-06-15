import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://limpio.app'
  const locales = ['es', 'en']

  const publicPages = ['', '/auth/login', '/auth/signup']

  const urls: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const page of publicPages) {
      urls.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: page === '' ? 1 : 0.8,
      })
    }
  }

  return urls
}
