import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Foydalanuvchilarni olishda xatolik yuz berdi.' },
      { status: 500 }
    )
  }
}
