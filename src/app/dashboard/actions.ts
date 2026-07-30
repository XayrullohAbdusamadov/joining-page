'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleUserRole(targetUserId: string) {
  // 1. Kirgan foydalanuvchi seansini olish
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user || !session.user.email) {
    throw new Error('Siz tizimga kirmagansiz.')
  }

  // 2. Rolni tekshirish (faqat adminlar uchun ruxsat etiladi)
  const userRole = (session.user as any).role
  if (userRole !== 'admin') {
    throw new Error('Sizda ushbu amalni bajarish huquqi yo\'q.')
  }

  // 3. Maqsadli foydalanuvchini topish
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  })

  if (!targetUser) {
    throw new Error('Foydalanuvchi topilmadi.')
  }

  // 4. O'zining rolini o'zgartira olmasligini tekshirish (himoya)
  if (targetUser.email === session.user.email) {
    throw new Error('O\'zingizning rolingizni o\'zgartira olmaysiz.')
  }

  // 5. Rolni almashtirish
  const newRole = (targetUser as any).role === 'admin' ? 'user' : 'admin'

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole } as any,
  })

  // 6. Keshni tozalash va ma'lumotlarni yangilash
  revalidatePath('/dashboard')
}
