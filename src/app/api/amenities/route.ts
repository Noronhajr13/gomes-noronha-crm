import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/amenities - Lista comodidades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where = includeInactive ? {} : { active: true }

    const amenities = await prisma.amenity.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ amenities })
  } catch (error) {
    console.error('Error fetching amenities:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar comodidades' },
      { status: 500 }
    )
  }
}

// POST /api/amenities - Criar comodidade
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
        { error: 'Nome da comodidade é obrigatório' },
        { status: 400 }
      )
    }

    // Obter a maior ordem existente
    const maxOrder = await prisma.amenity.aggregate({
      _max: { order: true }
    })

    const amenity = await prisma.amenity.create({
      data: {
        name: data.name,
        active: true,
        order: (maxOrder._max.order || 0) + 1,
      }
    })

    return NextResponse.json(amenity, { status: 201 })
  } catch (error) {
    console.error('Error creating amenity:', error)

    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma comodidade com este nome' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar comodidade' },
      { status: 500 }
    )
  }
}
