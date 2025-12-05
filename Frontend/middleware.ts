import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const PUBLIC_ROUTES: string[] = [
  '/', // Home page is public
  '/products',
  '/login',
  '/register',
  '/admin/login',
  '/otp',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/api',
  '/images',
  '/public',
]

function isPublicPath(pathname: string) {
  return PUBLIC_ROUTES.some((pub) => pathname === pub || pathname.startsWith(pub + '/'))
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  // Read role early so we can handle admin-specific public-route behavior
  const role = req.cookies.get('auth_role')?.value || 'USER'

  // If an admin visits the public products listing, redirect them to the admin dashboard
  // Admins manage inventory from the admin panel; they shouldn't use the storefront products page.
  if ((pathname === '/products' || pathname.startsWith('/products/')) && role === 'ADMIN') {
    const url = req.nextUrl.clone()
    url.pathname = '/admin'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Always allow static/public and explicit public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Read auth token from cookies (set on login)
  const token = req.cookies.get('auth_token')?.value

  // If no token, redirect to login with next param
  if (!token) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    const nextParam = pathname + (search || '')
    loginUrl.searchParams.set('next', nextParam)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based route restrictions
  // Admins should not access customer-facing shopping pages
  const adminOnlyPrefixes = ['/admin']
  const customerOnlyPrefixes = ['/cart', '/favorites', '/orders']

  const startsWithAny = (p: string, prefixes: string[]) => prefixes.some((x) => p === x || p.startsWith(x + '/'))

  if (role === 'ADMIN' && startsWithAny(pathname, customerOnlyPrefixes)) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (role !== 'ADMIN' && startsWithAny(pathname, adminOnlyPrefixes)) {
    const url = req.nextUrl.clone()
    url.pathname = '/products'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Apply to all routes except Next internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
  ],
}
