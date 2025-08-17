import { SignJWT, jwtVerify } from 'jose'

const enc = new TextEncoder()

export type AdminSession = {
  sub: string // admin email
  iat: number
  exp: number
}

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('ADMIN_JWT_SECRET not set')
  return enc.encode(secret)
}

export async function createSessionToken(email: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const now = Math.floor(Date.now() / 1000)
  const payload: AdminSession = { sub: email, iat: now, exp: now + maxAgeSeconds }
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt(payload.iat)
    .setExpirationTime(payload.exp)
    .sign(getSecret())
  return token
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret())
  return payload
}
