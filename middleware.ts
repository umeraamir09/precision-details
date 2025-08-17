import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const enc = new TextEncoder()

export const config = {
  matcher: ['/admin/:path*', '/api/bookings/:path*'],
}

async function isAuthed(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value
  const secret = process.env.ADMIN_JWT_SECRET
  if (!token || !secret) return false
  try {
    await jwtVerify(token, enc.encode(secret))
    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin/login')) return NextResponse.next()

  const authed = await isAuthed(req)

  if (pathname.startsWith('/api/')) {
    const adminKey = process.env.ADMIN_KEY
    const headerKey = req.headers.get('x-admin-key')
    if (adminKey && headerKey && headerKey === adminKey) {
      return NextResponse.next()
    }
    if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    if (!authed) {
      const url = new URL('/admin/login', req.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export default middleware