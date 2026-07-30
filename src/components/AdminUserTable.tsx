'use client'

import React, { useState } from 'react'
import { toggleUserRole } from '@/app/dashboard/actions'
import { UserCheck, ShieldAlert, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface UserType {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  createdAt: Date
}

interface AdminUserTableProps {
  users: UserType[]
  currentUserId: string
}

export function AdminUserTable({ users, currentUserId }: AdminUserTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleToggleRole = async (userId: string, userName: string | null) => {
    try {
      setLoadingId(userId)
      setError(null)
      setSuccess(null)

      await toggleUserRole(userId)
      
      setSuccess(`"${userName || 'Foydalanuvchi'}" roli muvaffaqiyatli o'zgartirildi.`)
    } catch (err: any) {
      setError(err.message || 'Rolni o\'zgartirishda xatolik yuz berdi.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="bg-card border border-border p-6 rounded-none mt-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Admin Panel</h2>
          <p className="text-xs text-muted mt-1">Tizimdagi barcha foydalanuvchilar ro'yxati va ularni boshqarish.</p>
        </div>
        <div className="text-xs bg-primary/10 border border-primary/20 text-primary font-bold px-3 py-1 uppercase tracking-wider">
          Admin Mode
        </div>
      </div>

      {/* Xabarlar */}
      {error && (
        <div className="mb-4 flex items-center gap-3 bg-red-950/40 border border-danger text-danger px-4 py-3 rounded-none text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-3 bg-emerald-950/40 border border-primary text-primary px-4 py-3 rounded-none text-xs">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Foydalanuvchilar jadvali */}
      <div className="overflow-x-auto border border-border">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="bg-background text-xs uppercase tracking-wider text-muted font-bold">
            <tr>
              <th className="px-6 py-3 border-b border-border">Foydalanuvchi</th>
              <th className="px-6 py-3 border-b border-border">Rol</th>
              <th className="px-6 py-3 border-b border-border">Qo'shilgan Sana</th>
              <th className="px-6 py-3 border-b border-border text-right">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {users.map((u) => {
              const isSelf = u.id === currentUserId
              const isAdmin = u.role === 'admin'

              return (
                <tr key={u.id} className="hover:bg-background/40 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    {u.image ? (
                      <img
                        src={u.image}
                        alt={u.name || 'User'}
                        className="w-8 h-8 rounded-none border border-border shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-border flex items-center justify-center text-muted font-bold shrink-0">
                        {u.name ? u.name[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-foreground">{u.name || 'Ismsiz'}</div>
                      <div className="text-xs text-muted font-mono">{u.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                        isAdmin
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-background border-border text-muted'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted font-mono">
                    {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isSelf ? (
                      <span className="text-xs text-muted-dark italic font-medium">Siz (O'zingiz)</span>
                    ) : (
                      <button
                        onClick={() => handleToggleRole(u.id, u.name || u.email)}
                        disabled={loadingId !== null}
                        className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors rounded-none disabled:opacity-50 disabled:cursor-not-allowed ${
                          isAdmin
                            ? 'border-danger/40 text-danger hover:bg-danger hover:text-white'
                            : 'border-primary/40 text-primary hover:bg-primary hover:text-black'
                        }`}
                      >
                        {loadingId === u.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isAdmin ? (
                          <UserCheck className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        )}
                        <span>{isAdmin ? "User qilish" : "Admin qilish"}</span>
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
