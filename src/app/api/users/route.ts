import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const mockUsers = [
      {
        id: 'admin-id',
        name: 'Admin',
        email: 'admin@gmail.com',
        image: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'mock-user-1',
        name: 'Hayrulloh',
        email: 'hayrulloh@gmail.com',
        image: null,
        createdAt: new Date().toISOString(),
      }
    ]

    return NextResponse.json({
      success: true,
      count: mockUsers.length,
      users: mockUsers,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Foydalanuvchilarni olishda xatolik yuz berdi.' },
      { status: 500 }
    )
  }
}
