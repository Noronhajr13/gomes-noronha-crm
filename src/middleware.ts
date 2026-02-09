import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedOrigins = [
  'https://www.gomesenoronha.com.br',
  'https://gomesenoronha.com.br',
  process.env.SITE_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[]

function getCorsOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin')
  if (origin && allowedOrigins.includes(origin)) {
    return origin
  }
  return null
}

export function middleware(request: NextRequest) {
  const corsOrigin = getCorsOrigin(request)

  // Para requisições OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        ...(corsOrigin && { 'Access-Control-Allow-Origin': corsOrigin }),
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Para outras requisições, adicionar headers CORS
  const response = NextResponse.next()

  // Permitir apenas rotas públicas da API
  if (corsOrigin && (
    request.nextUrl.pathname.startsWith('/api/properties') ||
    request.nextUrl.pathname.startsWith('/api/property-types') ||
    request.nextUrl.pathname.startsWith('/api/property-purposes') ||
    request.nextUrl.pathname.startsWith('/api/cities') ||
    request.nextUrl.pathname.startsWith('/api/neighborhoods') ||
    request.nextUrl.pathname.startsWith('/api/leads')
  )) {
    response.headers.set('Access-Control-Allow-Origin', corsOrigin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}
