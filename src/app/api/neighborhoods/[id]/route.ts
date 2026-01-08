import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/neighborhoods/[id] - Buscar bairro por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const neighborhood = await prisma.neighborhood.findUnique({
      where: { id: params.id },
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

    if (!neighborhood) {
      return NextResponse.json(
        { error: 'Bairro não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(neighborhood)
  } catch (error) {
    console.error('Error fetching neighborhood:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar bairro' },
      { status: 500 }
    )
  }
}

// PATCH /api/neighborhoods/[id] - Atualizar bairro
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

    const neighborhood = await prisma.neighborhood.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.cityId && { cityId: data.cityId }),
        ...(typeof data.active === 'boolean' && { active: data.active }),
        ...(typeof data.order === 'number' && { order: data.order }),
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

    return NextResponse.json(neighborhood)
  } catch (error) {
    console.error('Error updating neighborhood:', error)

    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um bairro com este nome nesta cidade' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar bairro' },
      { status: 500 }
    )
  }
}

// DELETE /api/neighborhoods/[id] - Excluir bairro
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

    await prisma.neighborhood.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting neighborhood:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir bairro' },
      { status: 500 }
    )
  }
}
