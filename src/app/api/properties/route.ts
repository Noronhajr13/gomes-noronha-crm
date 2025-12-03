import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/properties - Lista imóveis (público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de filtro
    const type = searchParams.get('type')
    const transactionType = searchParams.get('transactionType')
    const city = searchParams.get('city')
    const neighborhood = searchParams.get('neighborhood')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const bedrooms = searchParams.get('bedrooms')
    const featured = searchParams.get('featured')
    const status = searchParams.get('status')
    
    // Paginação
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Construir filtros
    const where: Record<string, unknown> = {}
    
    if (type) where.type = type
    if (transactionType) where.transactionType = transactionType
    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (neighborhood) where.neighborhood = { contains: neighborhood, mode: 'insensitive' }
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice)
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice)
    }
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) }
    if (featured === 'true') where.featured = true
    if (status) where.status = status
    else where.status = 'DISPONIVEL' // Padrão: apenas disponíveis

    // Buscar imóveis
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          }
        }
      }),
      prisma.property.count({ where })
    ])

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar imóveis' },
      { status: 500 }
    )
  }
}

// POST /api/properties - Criar imóvel (autenticado)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Gerar código único
    const code = `GN${Date.now().toString(36).toUpperCase()}`

    const property = await prisma.property.create({
      data: {
        ...data,
        code,
        userId: session.user.id
      }
    })

    // Registrar atividade
    await prisma.activity.create({
      data: {
        type: 'IMOVEL_CADASTRADO',
        description: `Imóvel ${property.code} cadastrado`,
        userId: session.user.id,
        metadata: { propertyId: property.id }
      }
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Erro ao criar imóvel' },
      { status: 500 }
    )
  }
}
