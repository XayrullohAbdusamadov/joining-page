'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { updateProfile } from './actions'
import Link from 'next/link'
import { ArrowLeft, User as UserIcon, Save, Mail, CheckCircle, AlertCircle } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (status === 'authenticated' && session?.user) {
      setName(session.user.name || '')
    }
  }, [status, session, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      setSuccessMessage(null)
      setErrorMessage(null)

      await updateProfile(name)

      // NextAuth seans ma'lumotlarini brauzerda yangilash
      await update({ name: name.trim() })

      setSuccessMessage("Profilingiz muvaffaqiyatli saqlandi!")
      router.refresh()
    } catch (err: any) {
      setErrorMessage(err.message || "Profilni saqlashda xatolik yuz berdi.")
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <svg className="animate-spin h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm text-muted">Profil yuklanmoqda...</span>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top navigatsiya */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-bold text-muted hover:text-foreground border border-border px-3 py-1.5 bg-background cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboardga qaytish</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-foreground">PROFIL</span>
          </div>
        </div>
      </nav>

      {/* Asosiy panel */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex justify-center">
        <div className="w-full max-w-2xl bg-card border border-border p-8 rounded-none">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-foreground">Profil sozlamalari</h1>
            <p className="text-xs text-muted mt-1">Shaxsiy ma'lumotlaringizni tahrirlashingiz mumkin.</p>
          </div>

          {/* Xabar bildirishnomalari */}
          {successMessage && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-950/40 border border-primary text-primary px-4 py-3 rounded-none text-sm">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 flex items-center gap-3 bg-red-950/40 border border-danger text-danger px-4 py-3 rounded-none text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4 p-4 bg-background border border-border">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Foydalanuvchi rasmi"
                  className="w-16 h-16 rounded-none border border-border"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 bg-card border border-border flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-muted" />
                </div>
              )}
              <div>
                <span className="text-xs text-muted font-bold block mb-1">Rasm manbasi (Google)</span>
                <p className="text-xs text-muted-dark truncate max-w-[300px] font-mono">
                  {session.user?.image || 'Profil rasmi o\'rnatilmagan'}
                </p>
              </div>
            </div>

            {/* Email (Readonly) */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted font-bold mb-2">
                Elektron pochta (O'zgartirib bo'lmaydi)
              </label>
              <div className="flex items-center gap-3 bg-background border border-border px-4 py-3 text-sm text-muted">
                <Mail className="w-4 h-4 text-muted-dark" />
                <span className="select-all">{session.user?.email}</span>
              </div>
            </div>

            {/* To'liq Ism (Editable) */}
            <div>
              <label htmlFor="name" className="block text-xs uppercase tracking-wider text-muted font-bold mb-2">
                To'liq ism va familiya
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ismingizni kiriting"
                className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-none"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-border/60 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 bg-primary text-black hover:bg-primary-hover active:bg-primary py-3 px-6 text-sm font-bold rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
