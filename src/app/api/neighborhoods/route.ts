import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/neighborhoods - Lista bairros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: Record<string, unknown> = {}

    if (cityId) where.cityId = cityId
    if (!includeInactive) where.active = true

    const neighborhoods = await prisma.neighborhood.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        city: {
          select: {
            id: true,
            name: true,
            state: true
          }
        }
      }
    })

    return NextResponse.json({ neighborhoods })
  } catch (error) {
    console.error('Error fetching neighborhoods:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar bairros' },
      { status: 500 }
    )
  }
}

// POST /api/neighborhoods - Criar bairro
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

    if (!data.name) {
      return NextResponse.json(
        { error: 'Nome do bairro é obrigatório' },
        { status: 400 }
      )
    }

    if (!data.cityId) {
      return NextResponse.json(
        { error: 'Cidade é obrigatória' },
        { status: 400 }
      )
    }

    // Verificar se a cidade existe
    const city = await prisma.city.findUnique({
      where: { id: data.cityId }
    })

    if (!city) {
      return NextResponse.json(
        { error: 'Cidade não encontrada' },
        { status: 400 }
      )
    }

    // Obter a maior ordem existente para esta cidade
    const maxOrder = await prisma.neighborhood.aggregate({
      where: { cityId: data.cityId },
      _max: { order: true }
    })

    const neighborhood = await prisma.neighborhood.create({
      data: {
        name: data.name,
        cityId: data.cityId,
        active: true,
        order: (maxOrder._max.order || 0) + 1,
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            state: true
          }
        }
      }
    })

    return NextResponse.json(neighborhood, { status: 201 })
  } catch (error) {
    console.error('Error creating neighborhood:', error)

    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um bairro com este nome nesta cidade' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar bairro' },
      { status: 500 }
    )
  }
}
