import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/cities - Lista cidades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where = includeInactive ? {} : { active: true }

    const cities = await prisma.city.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { neighborhoods: true }
        }
      }
    })

    return NextResponse.json({ cities })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cidades' },
      { status: 500 }
    )
  }
}

// POST /api/cities - Criar cidade
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
        { error: 'Nome da cidade é obrigatório' },
        { status: 400 }
      )
    }

    const city = await prisma.city.create({
      data: {
        name: data.name,
        state: data.state || 'MG',
        active: true,
      }
    })

    return NextResponse.json(city, { status: 201 })
  } catch (error) {
    console.error('Error creating city:', error)

    // Verifica se é erro de duplicidade
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma cidade com este nome neste estado' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar cidade' },
      { status: 500 }
    )
  }
}
