import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const email = session?.user?.email || 'test@gmail.com'
    const name = session?.user?.name || 'Test User'

    return NextResponse.json({
      success: true,
      user: {
        id: 'mock-id',
        name,
        email,
        image: null,
        createdAt: new Date().toISOString(),
        provider: 'credentials',
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
    const body = await request.json()
    const { name } = body

    return NextResponse.json({
      success: true,
      message: 'Profil muvaffaqiyatli yangilandi.',
      user: {
        id: 'mock-id',
        name: name || 'Test User',
        email: 'test@gmail.com',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Ichki server xatoligi yuz berdi.' },
      { status: 500 }
    )
  }
}
