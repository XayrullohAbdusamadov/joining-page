'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { LogIn, Shield, Layout, Smartphone, AlertTriangle } from 'lucide-react'

function LandingContent() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setErrorMessage("Google orqali autentifikatsiya qilishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.")
    }
  }, [searchParams])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (err: any) {
      setIsLoading(false)
      setErrorMessage("Tizimga kirishda xatolik yuz berdi.")
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
          Prisma SQLite va Google OAuth tizimi orqali to'liq xavfsizlik va mustaqillik kafolatlanadi.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-8 flex items-center gap-3 bg-red-950/40 border border-danger text-danger px-4 py-3 rounded-none max-w-xl text-left text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Login Button Container */}
        <div className="mt-10 w-full max-w-md">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-primary text-black hover:bg-primary-hover active:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background text-base font-bold py-4 px-6 rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Yuklanmoqda...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span className="font-semibold">Google orqali davom etish</span>
              </>
            )}
          </button>
        </div>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-24 text-left">
          {/* Card 1 */}
          <div className="bg-card border border-border p-6 rounded-none">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <LogIn className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Google OAuth tizimi</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Xavfsiz va parolsiz kirish tizimi. Profilingiz va ma'lumotlaringiz Google hisobingiz orqali avtomatik himoyalanadi.
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
