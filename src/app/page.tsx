'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { LogIn, Shield, Layout, Smartphone, AlertTriangle, Mail, Key, CheckCircle, User as UserIcon, Eye, EyeOff } from 'lucide-react'

// O'zbek tiliga xatoliklarni o'girish lug'ati
const mapAuthError = (errStr: string | null): string | null => {
  if (!errStr) return null
  const lower = errStr.toLowerCase()

  if (lower.includes('user already registered') || lower.includes('already exists') || lower.includes('already registered')) {
    return 'Ushbu elektron pochta manzili orqali allaqachon ro\'yxatdan o\'tilgan.'
  }
  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('email yoki parol xato') ||
    lower.includes('no user found')
  ) {
    return 'Elektron pochta yoki parol noto\'g\'ri. Iltimos, tekshirib qayta urinib ko\'ring.'
  }
  if (lower.includes('email va parol kiritilishi shart')) {
    return 'Elektron pochta va parol kiritilishi shart.'
  }
  if (lower.includes('credentials') || lower.includes('sign in failed')) {
    return 'Tizimga kirishda xatolik yuz berdi. Kiritilgan ma\'lumotlarni tekshiring.'
  }
  if (lower.includes('password should be') || lower.includes('weak-password') || lower.includes('should be at least 6 characters')) {
    return 'Parol juda zaif. Parol uzunligi kamida 6 ta belgidan iborat bo\'lishi shart.'
  }

  return errStr
}

function LandingContent() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  
  // Qo'shimcha state'lar
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Meni eslab qolish yuklanishi
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

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

    // Parol tekshiruvi (faqat ro'yxatdan o'tayotganda)
    if (isSignUp) {
      if (password.length < 6) {
        setErrorMessage("Parol kamida 6 ta belgidan iborat bo'lishi shart.")
        setIsLoading(false)
        return
      }
      if (password !== confirmPassword) {
        setErrorMessage("Parollar bir-biriga mos kelmadi. Iltimos, qayta tekshirib ko'ring.")
        setIsLoading(false)
        return
      }
    }

    try {
      const res = await signIn('credentials', {
        email,
        password,
        username,
        isSignUp: isSignUp ? 'true' : 'false',
        redirect: false,
      })

      if (res?.error) {
        setErrorMessage(mapAuthError(res.error))
        setIsLoading(false)
      } else {
        // Eslab qolish sozlamasi
        if (rememberMe) {
          localStorage.setItem('remembered_email', email)
        } else {
          localStorage.removeItem('remembered_email')
        }
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setErrorMessage(mapAuthError(err.message) || 'Xatolik yuz berdi.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl px-6 py-12 mx-auto md:py-20">
      {/* Header */}
      <header className="w-full flex items-center justify-between py-6 border-b border-border mb-12 md:mb-16">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
            <span className="text-black font-black text-xs">T</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">TIZIM</span>
        </div>
        <div className="text-xs text-muted font-medium bg-card px-3.5 py-1.5 border border-border/80 rounded-lg shadow-sm">
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
          Supabase Auth va Real-time Chat tizimi orqali to'liq xavfsizlik va mustaqillik kafolatlanadi.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-8 flex items-center gap-3 bg-red-950/40 border border-danger text-danger px-4 py-3 rounded-lg max-w-md w-full text-left text-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-8 flex items-center gap-3 bg-emerald-950/40 border border-primary text-primary px-4 py-3 rounded-lg max-w-md w-full text-left text-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Login/Register Form */}
        <div className="mt-10 w-full max-w-md bg-card/80 backdrop-blur-md border border-border/85 p-8 text-left rounded-xl shadow-lg relative overflow-hidden transition-all duration-300 hover:border-primary/25 hover:shadow-primary/5">
          <h2 className="text-xl font-extrabold text-foreground mb-6">
            {isSignUp ? "Ro'yxatdan o'tish" : "Tizimga kirish"}
          </h2>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {/* Inputlar almashinuvining silliq bo'lishi uchun alohida wrapperlar */}
            {isSignUp && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label htmlFor="username" className="block text-xs uppercase tracking-wider text-muted font-bold mb-2">
                  Ismingiz (Username)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 text-muted-dark" />
                  </span>
                  <input
                    type="text"
                    id="username"
                    required
                    disabled={isLoading}
                    placeholder="Masalan: Hayrulloh"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-background/55 border border-border pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 rounded-lg transition-all duration-200"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider text-muted font-bold mb-2">
                Elektron pochta
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-dark" />
                </span>
                <input
                  type="email"
                  id="email"
                  required
                  disabled={isLoading}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background/55 border border-border pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 rounded-lg transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider text-muted font-bold mb-2">
                Parol
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-muted-dark" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  disabled={isLoading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background/55 border border-border pl-10 pr-10 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 rounded-lg transition-all duration-200"
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-dark hover:text-muted cursor-pointer focus:outline-none disabled:cursor-not-allowed transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Tasdiqlash paroli (faqat ro'yxatdan o'tayotganda) */}
            {isSignUp && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label htmlFor="confirmPassword" className="block text-xs uppercase tracking-wider text-muted font-bold mb-2">
                  Parolni tasdiqlash
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-muted-dark" />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    required
                    disabled={isLoading}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-background/55 border border-border pl-10 pr-10 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 rounded-lg transition-all duration-200"
                  />
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-dark hover:text-muted cursor-pointer focus:outline-none disabled:cursor-not-allowed transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Meni eslab qolish checkbox */}
            <div className="flex items-center justify-between py-1 animate-in fade-in duration-200">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={isLoading}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary/25 accent-primary focus:ring-2 transition-all cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-xs text-muted font-medium hover:text-foreground transition-colors">
                  Meni eslab qol
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-black hover:bg-primary-hover active:scale-[0.98] py-3 px-6 text-sm font-bold rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3 shadow-md shadow-primary/10 transition-all duration-200"
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
                setPassword('')
                setConfirmPassword('')
              }}
              className="text-xs text-primary hover:underline font-bold bg-transparent border-none cursor-pointer transition-colors"
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
          <div className="bg-card/50 border border-border/70 p-6 rounded-xl transition-all duration-300 hover:border-primary/20 hover:bg-card/75 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 rounded-lg">
              <LogIn className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Supabase Auth tizimi</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Supabase orqali xavfsiz va ishonchli email/parol autentifikatsiyasi. Ma'lumotlaringiz to'liq himoyalanadi.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-card/50 border border-border/70 p-6 rounded-xl transition-all duration-300 hover:border-primary/20 hover:bg-card/75 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Real-time Muloqot</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Xabarlar real-time tarzda Supabase orqali uzatiladi. Har qanday qurilmadan lahzali muloqot qilishingiz mumkin.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-card/50 border border-border/70 p-6 rounded-xl transition-all duration-300 hover:border-primary/20 hover:bg-card/75 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 rounded-lg">
              <Layout className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Minimalist Dashboard</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Ortiqcha bezaklarsiz, sodda va samarali dizayn. Barcha boshqaruv tugmalari va ma'lumotlar doimo qo'l ostingizda.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-card/50 border border-border/70 p-6 rounded-xl transition-all duration-300 hover:border-primary/20 hover:bg-card/75 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 rounded-lg">
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

