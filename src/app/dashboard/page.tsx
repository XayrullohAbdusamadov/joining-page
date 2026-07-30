import React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Settings, User as UserIcon, Shield, Mail, Calendar, Key } from 'lucide-react'
import { DashboardHeader } from '@/components/DashboardHeader'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/')
  }

  // SQLite bazadan foydalanuvchini email orqali qidirish
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email || '' },
  })

  if (!dbUser) {
    redirect('/')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader avatarUrl={dbUser.image} />

      {/* Asosiy qism */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        {/* Xush kelibsiz sarlavhasi */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-foreground">
            Xush kelibsiz, <span className="text-primary">{dbUser.name || dbUser.email}</span>!
          </h1>
          <p className="text-sm text-muted mt-1">Bu sizning shaxsiy va xavfsiz boshqaruv panelingiz (SQLite + Prisma).</p>
        </div>

        {/* Grid panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Foydalanuvchi kartasi */}
          <div className="bg-card border border-border p-6 rounded-none flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs uppercase tracking-wider text-muted font-bold">Foydalanuvchi ma'lumotlari</span>
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center gap-4 mb-6">
                {dbUser.image ? (
                  <img
                    src={dbUser.image}
                    alt="Foydalanuvchi rasmi"
                    className="w-16 h-16 rounded-none border border-border"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 bg-border flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-muted" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-foreground truncate max-w-[180px]">
                    {dbUser.name || 'Ism kiritilmagan'}
                  </h3>
                  <span className="text-xs text-muted font-medium bg-background px-2 py-0.5 border border-border mt-1 inline-block">
                    Faol (Mahalliy)
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-border/60">
                <div className="flex items-center gap-2.5 text-sm text-muted">
                  <Mail className="w-4 h-4 text-muted-dark shrink-0" />
                  <span className="truncate">{dbUser.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-muted">
                  <Calendar className="w-4 h-4 text-muted-dark shrink-0" />
                  <span>
                    Qo'shilgan: {new Date(dbUser.createdAt).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border/60">
              <Link
                href="/profile"
                className="w-full flex items-center justify-center gap-2 bg-foreground text-background hover:bg-muted active:bg-foreground py-2.5 text-sm font-bold rounded-none"
              >
                <Settings className="w-4 h-4" />
                <span>Profilni tahrirlash</span>
              </Link>
            </div>
          </div>

          {/* 2. SQLite / Google OAuth xavfsizlik tafsilotlari */}
          <div className="bg-card border border-border p-6 rounded-none md:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-wider text-muted font-bold">Xavfsizlik & Autentifikatsiya</span>
              <Key className="w-4 h-4 text-primary" />
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-foreground">Autentifikatsiya provayderi</h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Siz ushbu tizimga Google OAuth xizmati orqali xavfsiz tasdiqlash bilan kirdingiz. NextAuth.js yordamida o'rnatilgan sessiyangiz mahalliy SQLite ma'lumotlar bazasida (`dev.db`) saqlanadi.
                </p>
              </div>

              <div className="border-t border-border/60 pt-4">
                <h4 className="text-sm font-bold text-foreground">Mahalliy foydalanuvchi ID (Prisma ID)</h4>
                <p className="text-xs text-muted mt-1 font-mono break-all bg-background p-2 border border-border select-all">
                  {dbUser.id}
                </p>
              </div>

              <div className="border-t border-border/60 pt-4">
                <h4 className="text-sm font-bold text-foreground">Google hisob bog'liqligi</h4>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                  <span className="text-xs text-foreground font-medium">
                    Google hisobi: {dbUser.email} (tasdiqlangan)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
