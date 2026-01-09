import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/amenities/[id] - Buscar comodidade por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const amenity = await prisma.amenity.findUnique({
      where: { id: params.id }
    })

    if (!amenity) {
      return NextResponse.json(
        { error: 'Comodidade não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(amenity)
  } catch (error) {
    console.error('Error fetching amenity:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar comodidade' },
      { status: 500 }
    )
  }
}

// PATCH /api/amenities/[id] - Atualizar comodidade
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

    const amenity = await prisma.amenity.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(typeof data.active === 'boolean' && { active: data.active }),
        ...(typeof data.order === 'number' && { order: data.order }),
      }
    })

    return NextResponse.json(amenity)
  } catch (error) {
    console.error('Error updating amenity:', error)

    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma comodidade com este nome' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar comodidade' },
      { status: 500 }
    )
  }
}

// DELETE /api/amenities/[id] - Excluir comodidade
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

    await prisma.amenity.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting amenity:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir comodidade' },
      { status: 500 }
    )
  }
}
