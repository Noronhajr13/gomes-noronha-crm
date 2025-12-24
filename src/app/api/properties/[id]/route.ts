import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/properties/[id] - Detalhes do imóvel (aceita id ou code)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id

    // Verifica se é um CUID (formato: começa com 'c' seguido de ~24 caracteres alfanuméricos)
    const isCuid = /^c[a-z0-9]{20,}$/i.test(identifier)

    const property = await prisma.property.findUnique({
      where: isCuid ? { id: identifier } : { code: identifier },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Imóvel não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar imóvel' },
      { status: 500 }
    )
  }
}

// PUT /api/properties/[id] - Atualizar imóvel
export async function PUT(
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

    const property = await prisma.property.update({
      where: { id: params.id },
      data
    })

    // Registrar atividade
    await prisma.activity.create({
      data: {
        type: 'IMOVEL_ATUALIZADO',
        description: `Imóvel ${property.code} atualizado`,
        userId: session.user.id,
        metadata: { propertyId: property.id }
      }
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar imóvel' },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id] - Deletar imóvel
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

    // Soft delete - apenas inativar
    const property = await prisma.property.update({
      where: { id: params.id },
      data: { status: 'INATIVO' }
    })

    return NextResponse.json({ success: true, property })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar imóvel' },
      { status: 500 }
    )
  }
}
