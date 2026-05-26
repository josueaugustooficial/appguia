import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // ✅ FIX: Guarda de variáveis de ambiente.
  // Se estiverem ausentes no Vercel, redireciona para /login em vez de travar.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[middleware] Variáveis de ambiente Supabase ausentes.')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ✅ FIX: try/catch em toda a verificação de autenticação.
  // Se o Supabase não responder (timeout, erro de rede, key inválida),
  // a request NÃO fica pendurada — redireciona para /login imediatamente.
  let user = null
  try {
    const result = await supabase.auth.getUser()
    user = result.data?.user ?? null
  } catch (err) {
    console.error('[middleware] Falha ao verificar usuário:', err)
    // Se não conseguir verificar, trata como não autenticado
    user = null
  }

  // Rota de callback de auth — sempre deixa passar
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return supabaseResponse
  }

  // Rotas públicas (não precisam de autenticação)
  const publicRoutes = ['/login', '/passaporte']
  const isPublic = publicRoutes.some(r => request.nextUrl.pathname.startsWith(r))

  // Não autenticado em rota protegida → /login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Autenticado tentando acessar /login → /home
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  // Raiz / → /home (autenticado) ou /login (não autenticado)
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = user ? '/home' : '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
