import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
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
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google login vaqtincha disabled qilindi
    /*
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    */
    CredentialsProvider({
      name: 'Supabase Email',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        isSignUp: { label: 'Is SignUp', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim()
        const password = credentials?.password

        if (!email || !password) {
          throw new Error('Email va parol kiritilishi shart.')
        }

        // 1. Admin bypass tekshiruvi (admin@gmail.com va Hayrulloh2012)
        if (email === 'admin@gmail.com' && password === 'Hayrulloh2012') {
          let dbUser = await prisma.user.findUnique({
            where: { email },
          })

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email,
                name: 'Admin',
                role: 'admin',
              } as any,
            })
          } else if ((dbUser as any).role !== 'admin') {
            dbUser = await prisma.user.update({
              where: { email },
              data: { role: 'admin' } as any,
            })
          }

          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: (dbUser as any).role,
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
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          })

          if (error) {
            throw new Error(error.message || 'Registratsiyada xatolik yuz berdi.')
          }

          if (!data.user) {
            throw new Error('Foydalanuvchi yaratilmadi.')
          }

          // SQLite bazasida foydalanuvchini tekshiramiz/yaratamiz
          let dbUser = await prisma.user.findUnique({
            where: { email },
          })

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email,
                name: email.split('@')[0], // standart ism
                role: 'user', // default role
              } as any,
            })
          }

          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: (dbUser as any).role,
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

          // SQLite bazasida foydalanuvchini tekshiramiz/yaratamiz
          let dbUser = await prisma.user.findUnique({
            where: { email },
          })

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email,
                name: email.split('@')[0],
                role: 'user',
              } as any,
            })
          }

          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: (dbUser as any).role,
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
      } else if (token.sub) {
        // Rol o'zgargan bo'lsa uni bazadan yangilab olamiz
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true } as any,
        })
        if (dbUser) {
          token.role = (dbUser as any).role
        }
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
