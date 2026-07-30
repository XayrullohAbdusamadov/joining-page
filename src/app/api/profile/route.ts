import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// Helper to authenticate user from session or Bearer token (for Apidog testing)
async function getAuthenticatedUserEmail(request: NextRequest): Promise<string | null> {
  // 1. NextAuth sessiyasini tekshirish
  const session = await getServerSession(authOptions)
  if (session?.user?.email) {
    return session.user.email
  }

  // 2. Apidog/Postman uchun Bearer token tekshiruvi (faqat test/dev yoki maxsus holatlar uchun)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim()
    if (token) {
      if (token.includes('@')) {
        return token // token email sifatida berilgan
      } else {
        // token user ID bo'lsa
        const user = await prisma.user.findUnique({
          where: { id: token },
        })
        return user?.email || null
      }
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const email = await getAuthenticatedUserEmail(request)

    if (!email) {
      return NextResponse.json(
        { error: 'Siz tizimga kirmagansiz. Cookie yoki Authorization header (Bearer) yuboring.' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        provider: user.accounts[0]?.provider || 'credentials',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Ichki server xatoligi yuz berdi.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const email = await getAuthenticatedUserEmail(request)

    if (!email) {
      return NextResponse.json(
        { error: 'Siz tizimga kirmagansiz. Cookie yoki Authorization header (Bearer) yuboring.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Ism maydoni boʻsh boʻlishi mumkin emas.' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { name: name.trim() },
    })

    return NextResponse.json({
      success: true,
      message: 'Profil muvaffaqiyatli yangilandi.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Profilni yangilashda xatolik yuz berdi.' },
      { status: 500 }
    )
  }
}
