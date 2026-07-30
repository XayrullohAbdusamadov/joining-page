'use client'

import React from 'react'
import { signOut } from 'next-auth/react'
import { LogOut, User as UserIcon } from 'lucide-react'

interface HeaderProps {
  avatarUrl?: string | null
}

export function DashboardHeader({ avatarUrl }: HeaderProps) {
  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-none flex items-center justify-center">
            <span className="text-black font-black text-xs">T</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">TIZIM</span>
        </div>

        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Foydalanuvchi rasmi"
              className="w-8 h-8 rounded-none border border-border"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 bg-border flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-muted" />
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 border border-border px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger hover:text-white cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Chiqish</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
