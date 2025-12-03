import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/leads/[id] - Detalhes do lead
export async function GET(
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

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        property: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        visits: {
          orderBy: { scheduledAt: 'desc' }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error fetching lead:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar lead' },
      { status: 500 }
    )
  }
}

// PUT /api/leads/[id] - Atualizar lead
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
    const previousLead = await prisma.lead.findUnique({
      where: { id: params.id }
    })

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        ...data,
        contactedAt: data.status !== 'NOVO' && !previousLead?.contactedAt 
          ? new Date() 
          : previousLead?.contactedAt
      }
    })

    // Registrar mudança de status
    if (previousLead?.status !== data.status) {
      await prisma.activity.create({
        data: {
          type: 'LEAD_STATUS_ALTERADO',
          description: `Status alterado de ${previousLead?.status} para ${data.status}`,
          userId: session.user.id,
          leadId: lead.id,
          metadata: { 
            previousStatus: previousLead?.status,
            newStatus: data.status 
          }
        }
      })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar lead' },
      { status: 500 }
    )
  }
}
