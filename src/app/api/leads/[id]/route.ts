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

// PUT /api/leads/[id] - Atualizar lead (todos os campos)
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

    if (!previousLead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        source: data.source,
        status: data.status,
        message: data.message,
        budget: data.budget,
        interestType: data.interestType,
        preferredNeighborhoods: data.preferredNeighborhoods,
        score: data.score,
        propertyId: data.propertyId,
        userId: data.userId,
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
    } else {
      // Registrar atualização geral
      await prisma.activity.create({
        data: {
          type: 'LEAD_ATUALIZADO',
          description: `Lead ${lead.name} atualizado`,
          userId: session.user.id,
          leadId: lead.id,
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

// PATCH /api/leads/[id] - Atualizar parcialmente (ex: apenas status)
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
    const previousLead = await prisma.lead.findUnique({
      where: { id: params.id }
    })

    if (!previousLead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = { ...data }
    
    // Se está mudando de NOVO para outro status, registrar data de contato
    if (data.status && data.status !== 'NOVO' && !previousLead.contactedAt) {
      updateData.contactedAt = new Date()
    }

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: updateData
    })

    // Registrar mudança de status
    if (data.status && previousLead.status !== data.status) {
      await prisma.activity.create({
        data: {
          type: 'LEAD_STATUS_ALTERADO',
          description: `Status alterado de ${previousLead.status} para ${data.status}`,
          userId: session.user.id,
          leadId: lead.id,
          metadata: { 
            previousStatus: previousLead.status,
            newStatus: data.status 
          }
        }
      })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error patching lead:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar lead' },
      { status: 500 }
    )
  }
}

// DELETE /api/leads/[id] - Excluir lead
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

    const lead = await prisma.lead.findUnique({
      where: { id: params.id }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    // Excluir atividades e visitas relacionadas primeiro
    await prisma.activity.deleteMany({
      where: { leadId: params.id }
    })

    await prisma.visit.deleteMany({
      where: { leadId: params.id }
    })

    // Excluir o lead
    await prisma.lead.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Lead excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir lead' },
      { status: 500 }
    )
  }
}
