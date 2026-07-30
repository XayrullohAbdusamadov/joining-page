import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== 'your-supabase-url' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-supabase-anon-key'

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Supabase Email',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        isSignUp: { label: 'Is SignUp', type: 'text' },
        username: { label: 'Username', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim()
        const password = credentials?.password

        if (!email || !password) {
          throw new Error('Email va parol kiritilishi shart.')
        }

        // 1. Admin bypass tekshiruvi (admin@gmail.com va Hayrulloh2012)
        if (email === 'admin@gmail.com' && password === 'Hayrulloh2012') {
          return {
            id: 'admin-id',
            email: 'admin@gmail.com',
            name: ',Admin.', // Chat-app uchun Super Admin nomi formatda
            role: 'admin',
          }
        }

        // Standart foydalanuvchilar uchun Supabase konfiguratsiyasi shart
        if (!isSupabaseConfigured || !supabase) {
          throw new Error(
            'Supabase sozlamalari (.env) kiritilmagan. Iltimos, NEXT_PUBLIC_SUPABASE_URL va NEXT_PUBLIC_SUPABASE_ANON_KEY qiymatlarini kiriting.'
          )
        }

        const isSignUp = credentials?.isSignUp === 'true'

        if (isSignUp) {
          // 2. Ro'yxatdan o'tish (Register)
          const username = (credentials as any)?.username || email.split('@')[0]
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: username,
              },
            },
          })

          if (error) {
            throw new Error(error.message || 'Registratsiyada xatolik yuz berdi.')
          }

          if (!data.user) {
            throw new Error('Foydalanuvchi yaratilmadi.')
          }

          return {
            id: data.user.id,
            email: data.user.email || email,
            name: username,
            role: 'user',
          }
        } else {
          // 3. Tizimga kirish (Login)
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            throw new Error(error.message || 'Email yoki parol xato.')
          }

          if (!data.user) {
            throw new Error('Tizimga kirishda xatolik.')
          }

          return {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || (data.user.email || email).split('@')[0],
            role: 'user',
          }
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).role = token.role || 'user'
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.role = (user as any).role || 'user'
      }
      return token
    },
  },
  pages: {
    signIn: '/',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
