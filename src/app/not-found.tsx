import React from 'react'
import Link from 'next/link'
import { AlertCircle, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-6 text-center">
      <div className="w-16 h-16 bg-danger/10 border border-danger/30 flex items-center justify-center mb-6 animate-pulse">
        <AlertCircle className="w-8 h-8 text-danger" />
      </div>

      <h1 className="text-6xl font-black tracking-tighter text-foreground mb-4">404</h1>
      
      <h2 className="text-xl font-bold mb-3 text-foreground">Sahifa topilmadi</h2>
      
      <p className="text-sm text-muted max-w-sm leading-relaxed mb-10">
        Siz qidirayotgan sahifa mavjud emas, nomi o'zgartirilgan yoki vaqtincha o'chirilgan bo'lishi mumkin.
      </p>

      <Link
        href="/"
        className="flex items-center gap-2 bg-primary text-black hover:bg-primary-hover active:bg-primary py-3 px-6 text-sm font-bold rounded-none cursor-pointer"
      >
        <Home className="w-4 h-4" />
        <span>Bosh sahifaga qaytish</span>
      </Link>
    </div>
  )
}
