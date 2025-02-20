import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookies()).get(name)?.value
        },
        set(name: string, value: string, options?: any) {
          supabaseResponse.cookies.set(name, value, options)
        },
        remove(name: string, options?: any) {
          supabaseResponse.cookies.set(name, '', { ...options, maxAge: -1 })
        },
      },
    }
  )

  // Refreshing the auth token to ensure session persistence
  await supabase.auth.getUser()

  return supabaseResponse
}
