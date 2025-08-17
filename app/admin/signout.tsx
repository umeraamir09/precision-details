"use client"
import { Button } from '@/app/components/shadcn/button'

export default function AdminLogout() {
  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    
    window.location.href = '/admin/login'
  }
  return (
    <Button onClick={logout} variant="secondary" className="rounded-full">Sign out</Button>
  )
}
