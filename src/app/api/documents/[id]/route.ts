import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar documento antes de deletar para registrar atividade
    const document = await prisma.document.findUnique({
      where: { id: params.id }
    })

    await prisma.document.delete({
      where: { id: params.id },
    })

    // Registrar atividade de exclusão
    if (document) {
      await prisma.activity.create({
        data: {
          type: 'DOCUMENTO_EXCLUIDO',
          description: `Documento "${document.title}" excluído`,
          userId: session.user.id,
          leadId: document.leadId || undefined,
          metadata: {
            documentTitle: document.title,
            documentType: document.type
          }
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Erro ao deletar documento' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    const document = await prisma.document.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        tags: data.tags,
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
          },
        },
      },
    })

    // Registrar atividade de atualização
    await prisma.activity.create({
      data: {
        type: 'DOCUMENTO_ATUALIZADO',
        description: `Documento "${document.title}" atualizado`,
        userId: session.user.id,
        leadId: document.leadId || undefined,
        metadata: {
          documentId: document.id,
          documentTitle: document.title
        }
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json({ error: 'Erro ao atualizar documento' }, { status: 500 })
  }
}
