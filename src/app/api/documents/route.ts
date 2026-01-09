import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const leadId = searchParams.get('leadId') || ''
    const propertyId = searchParams.get('propertyId') || ''

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (type) {
      where.type = type
    }

    if (leadId) {
      where.leadId = leadId
    }

    if (propertyId) {
      where.propertyId = propertyId
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          category: true,
          fileUrl: true,
          fileName: true,
          fileSize: true,
          mimeType: true,
          tags: true,
          leadId: true,
          propertyId: true,
          uploadedBy: {
            select: {
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.document.count({ where }),
    ])

    return NextResponse.json({
      documents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Erro ao buscar documentos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    const document = await prisma.document.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        tags: data.tags || [],
        leadId: data.leadId,
        propertyId: data.propertyId,
        userId: session.user.id,
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
          },
        },
      },
    })

    // Registrar atividade de criação de documento
    await prisma.activity.create({
      data: {
        type: 'DOCUMENTO_CRIADO',
        description: `Documento "${document.title}" criado`,
        userId: session.user.id,
        leadId: document.leadId || undefined,
        metadata: {
          documentId: document.id,
          documentTitle: document.title,
          documentType: document.type,
          propertyId: document.propertyId
        }
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Erro ao criar documento' }, { status: 500 })
  }
}
