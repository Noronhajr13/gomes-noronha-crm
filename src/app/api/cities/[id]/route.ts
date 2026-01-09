import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/cities/[id] - Buscar cidade por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const city = await prisma.city.findUnique({
      where: { id: params.id },
      include: {
        neighborhoods: {
          where: { active: true },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!city) {
      return NextResponse.json(
        { error: 'Cidade não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(city)
  } catch (error) {
    console.error('Error fetching city:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cidade' },
      { status: 500 }
    )
  }
}

// PATCH /api/cities/[id] - Atualizar cidade
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()

    const city = await prisma.city.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.state && { state: data.state }),
        ...(typeof data.active === 'boolean' && { active: data.active }),
      }
    })

    return NextResponse.json(city)
  } catch (error) {
    console.error('Error updating city:', error)

    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma cidade com este nome neste estado' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar cidade' },
      { status: 500 }
    )
  }
}

// DELETE /api/cities/[id] - Excluir cidade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se existem bairros vinculados
    const neighborhoodsCount = await prisma.neighborhood.count({
      where: { cityId: params.id }
    })

    if (neighborhoodsCount > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir. Existem ${neighborhoodsCount} bairro(s) vinculado(s) a esta cidade.` },
        { status: 400 }
      )
    }

    await prisma.city.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting city:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir cidade' },
      { status: 500 }
    )
  }
}
