import React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { ChatApp } from '@/components/ChatApp'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/')
  }

  // Get user info from NextAuth session
  const user = {
    name: session.user.name || session.user.email || 'Foydalanuvchi',
    email: session.user.email || '',
    image: session.user.image || '',
    role: (session.user as any).role || 'user',
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#070b14]">
      <ChatApp user={user} />
    </div>
  )
}
