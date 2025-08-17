"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/shadcn/button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Login failed')
      router.push('/admin')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-heading text-2xl text-white">Admin Login</h1>
      <p className="text-sm text-muted-foreground mt-2">Enter your admin email and password.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Email</label>
          <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-background/60 px-3 py-2 text-sm text-white outline-none" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Password</label>
          <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-background/60 px-3 py-2 text-sm text-white outline-none" />
        </div>
        {error && <div className="text-sm text-red-400">{error}</div>}
        <Button type="submit" disabled={loading} className="rounded-full px-5">{loading ? 'Signing in…' : 'Sign in'}</Button>
      </form>
    </main>
  )
}
