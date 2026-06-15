import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { locales, defaultLocale } from './i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Detect locale from path
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  const locale = pathnameLocale || defaultLocale

  // Only protect /[locale]/app/* routes
  const isAppRoute = new RegExp(`^/${locale}/app`).test(pathname)

  if (!isAppRoute) {
    // Non-protected routes: just apply i18n middleware
    return intlMiddleware(request)
  }

  // Protected routes: start with the intl response (preserves locale headers)
  // then layer Supabase auth on top
  const intlResponse = intlMiddleware(request)

  // If intl already wants to redirect (e.g. wrong locale), honour it
  if (intlResponse.status !== 200) return intlResponse

  let response = intlResponse

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          // Write auth cookies onto the response without losing intl headers
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
