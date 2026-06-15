import { NextRequest, NextResponse } from 'next/server'

/**
 * PWA Share Target handler.
 * Receives shared content (text, url) and redirects to diary with pre-filled note.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const text = formData.get('text')?.toString() || ''
    const url = formData.get('url')?.toString() || ''
    const combined = [text, url].filter(Boolean).join('\n')

    // Redirect to diary page with shared content as query param
    const redirectUrl = new URL('/es/app/diary', req.url)
    if (combined) {
      redirectUrl.searchParams.set('shared', encodeURIComponent(combined.slice(0, 500)))
    }

    return NextResponse.redirect(redirectUrl, 303)
  } catch {
    return NextResponse.redirect(new URL('/es/app', req.url), 303)
  }
}
