import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/signup']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next()

  const userId = request.cookies.get('takura_user')?.value
  if (!userId) {
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
