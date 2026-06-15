import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://limpio.app'

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/es/', '/en/'],
      disallow: ['/es/app/', '/en/app/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
