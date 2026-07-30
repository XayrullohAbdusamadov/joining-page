import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const url = request.nextUrl.clone()

  // Himoyalangan sahifalarga kirishni cheklash (Dashboard va Profil)
  if (!token && (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/profile'))) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Tizimga kirgan foydalanuvchini landing sahifasidan dashboardga yo'naltirish
  if (token && url.pathname === '/') {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export default proxy

export const config = {
  matcher: [
    /*
     * Match barcha sahifalarni quyidagilardan tashqari:
     * - _next/static (statik fayllar)
     * - _next/image (rasmlarni optimallashtirish fayllari)
     * - favicon.ico (favicon fayli)
     * - barcha turdagi rasmlar va rasmli fayl formatlari
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
