'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProfile(name: string) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user || !session.user.email) {
    throw new Error('Siz tizimga kirmagansiz.')
  }

  if (!name.trim()) {
    throw new Error('Ism maydoni boʻsh boʻlishi mumkin emas.')
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { name: name.trim() },
  })

  revalidatePath('/dashboard')
  revalidatePath('/profile')
}
