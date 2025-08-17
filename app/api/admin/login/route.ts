import { NextResponse } from 'next/server'
import { createSessionToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json() as { email?: string; password?: string }
    const email = (body.email || '').trim().toLowerCase()
    const password = body.password || ''

    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 })
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await createSessionToken(email)
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, 
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
