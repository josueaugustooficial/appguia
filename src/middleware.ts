import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // ✅ Guarda de variáveis de ambiente.
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

  // ✅ try/catch em toda verificação de autenticação.
  let user = null
  try {
    const result = await supabase.auth.getUser()
    user = result.data?.user ?? null
  } catch (err) {
    console.error('[middleware] Falha ao verificar usuário:', err)
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

  // ✅ FASE 3 — Verificação de onboarding:
  // Usuário autenticado mas sem filho cadastrado → /onboarding (obrigatório)
  // Esta verificação só roda em rotas do app (não onboarding, não rotas públicas)
  if (
    user &&
    !request.nextUrl.pathname.startsWith('/onboarding') &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/passaporte') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api')
  ) {
    try {
      // Query leve — busca apenas existência de filho, não dados completos
      const { data: children, error } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', user.id)
        .limit(1)

      if (!error && (!children || children.length === 0)) {
        // Usuário sem filho → redireciona para onboarding obrigatório
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
    } catch (err) {
      // Se a query falhar, deixa o usuário passar (não trava o app)
      console.error('[middleware] Falha ao verificar filhos:', err)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
