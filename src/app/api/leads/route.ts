import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/leads - Lista leads (autenticado)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    
    // Filtros
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')
    
    // Paginação
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    
    if (status) where.status = status
    if (source) where.source = source
    if (userId) where.userId = userId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: {
              id: true,
              code: true,
              title: true
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.lead.count({ where })
    ])

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar leads' },
      { status: 500 }
    )
  }
}

// POST /api/leads - Criar lead
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { 
      name, 
      email, 
      phone, 
      cpf,
      message, 
      propertyId, 
      userId,
      source = 'SITE',
      status = 'NOVO',
      budget,
      interestType,
      preferredNeighborhoods,
      score = 50
    } = data

    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        cpf: cpf || null,
        message: message || null,
        source,
        status,
        budget: budget || null,
        interestType: interestType || null,
        preferredNeighborhoods: preferredNeighborhoods || [],
        score: score || 50,
        propertyId: propertyId || null,
        userId: userId || null,
      }
    })

    // Se há sessão, registrar atividade
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      await prisma.activity.create({
        data: {
          type: 'LEAD_CRIADO',
          description: `Lead ${name} criado`,
          userId: session.user.id,
          leadId: lead.id,
        }
      })
    }

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Erro ao criar lead' },
      { status: 500 }
    )
  }
}
