'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { LogIn, Shield, Layout, Smartphone, AlertTriangle, Mail, Key, CheckCircle } from 'lucide-react'

function LandingContent() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setErrorMessage("Autentifikatsiya qilishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.")
    }
  }, [searchParams])

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        isSignUp: isSignUp ? 'true' : 'false',
        redirect: false,
      })

      if (res?.error) {
        setErrorMessage(res.error)
        setIsLoading(false)
      } else {
        if (isSignUp) {
          setSuccessMessage("Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi kirishingiz mumkin.")
          setIsSignUp(false)
          setPassword('')
        } else {
          window.location.href = '/dashboard'
        }
        setIsLoading(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Xatolik yuz berdi.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl px-6 py-12 mx-auto md:py-20">
      {/* Header */}
      <header className="w-full flex items-center justify-between py-6 border-b border-border mb-12 md:mb-16">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-none flex items-center justify-center">
            <span className="text-black font-black text-xs">T</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">TIZIM</span>
        </div>
        <div className="text-xs text-muted font-medium bg-card px-3 py-1.5 border border-border">
          V1.0.0 (O'zbekcha)
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center w-full">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl leading-tight">
          Zamonaviy va Xavfsiz <span className="text-primary">Shaxsiy Platforma</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted max-w-2xl leading-relaxed">
          Ma'lumotlaringizni boshqarish va nazorat qilish uchun mo'ljallangan minimalist ishchi hudud. 
          Prisma SQLite va Supabase Auth tizimi orqali to'liq xavfsizlik va mustaqillik kafolatlanadi.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-8 flex items-center gap-3 bg-red-950/40 border border-danger text-danger px-4 py-3 rounded-none max-w-md w-full text-left text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-8 flex items-center gap-3 bg-emerald-950/40 border border-primary text-primary px-4 py-3 rounded-none max-w-md w-full text-left text-sm">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Login/Register Form */}
        <div className="mt-10 w-full max-w-md bg-card border border-border p-8 text-left">
          <h2 className="text-xl font-extrabold text-foreground mb-6">
            {isSignUp ? "Ro'yxatdan o'tish" : "Tizimga kirish"}
          </h2>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider text-muted font-bold mb-2">
                Elektron pochta
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-dark" />
                </span>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider text-muted font-bold mb-2">
                Parol
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-muted-dark" />
                </span>
                <input
                  type="password"
                  id="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-black hover:bg-primary-hover active:bg-primary py-3 px-6 text-sm font-bold rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Kutilmoqda...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{isSignUp ? "Ro'yxatdan o'tish" : "Kirish"}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/60 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setErrorMessage(null)
                setSuccessMessage(null)
              }}
              className="text-xs text-primary hover:underline font-bold bg-transparent border-none cursor-pointer"
            >
              {isSignUp
                ? "Sizda hisob bormi? Tizimga kiring"
                : "Yangi hisob yaratish (Ro'yxatdan o'tish)"}
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-24 text-left">
          {/* Card 1 */}
          <div className="bg-card border border-border p-6 rounded-none">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <LogIn className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Supabase Auth tizimi</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Supabase orqali xavfsiz va ishonchli email/parol autentifikatsiyasi. Ma'lumotlaringiz to'liq himoyalanadi.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-card border border-border p-6 rounded-none">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Mustaqil SQLite bazasi</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Loyiha bazasi o'z serveringizdagi SQLite faylida saqlanadi. Tashqi bulut xizmatlariga mutlaqo bog'liq emassiz.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-card border border-border p-6 rounded-none">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Layout className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Minimalist Dashboard</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Ortiqcha bezaklarsiz, sodda va samarali dizayn. Barcha boshqaruv tugmalari va ma'lumotlar doimo qo'l ostingizda.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-card border border-border p-6 rounded-none">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Moslashuvchan Dizayn</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Mobil telefonlar, planshetlar va kompyuterlar uchun optimallashtirilgan silliq, tezkor foydalanuvchi tajribasi.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full text-center mt-24 pt-6 border-t border-border text-xs text-muted-dark flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          &copy; {new Date().getFullYear()} TIZIM. Barcha huquqlar himoyalangan.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span>Yaratuvchi: <strong className="text-foreground">Hayrulloh Abdusamadov</strong></span>
          <span className="text-border">|</span>
          <span>Telegram kanal: <a href="https://t.me/HayrullohAdusamadov" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">@HayrullohAdusamadov</a></span>
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen text-muted text-sm">
        Yuklanmoqda...
      </div>
    }>
      <LandingContent />
    </Suspense>
  )
}
