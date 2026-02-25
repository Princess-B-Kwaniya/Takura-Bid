import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/signup']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const cookieStore = request.cookies
  const userId = cookieStore.get('takura_user')?.value

  // PUBLIC_ROUTES check
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next()

  if (!userId) {
    // If it's an API request, return 401 instead of redirecting
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
