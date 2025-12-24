import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard - Estatísticas do dashboard
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Estatísticas de imóveis
    const [
      totalProperties,
      availableProperties,
      soldProperties,
      rentedProperties,
      featuredProperties
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'DISPONIVEL' } }),
      prisma.property.count({ where: { status: 'VENDIDO' } }),
      prisma.property.count({ where: { status: 'ALUGADO' } }),
      prisma.property.count({ where: { featured: true } })
    ])

    // Estatísticas de leads (usando status corretos do enum)
    const [
      totalLeads,
      newLeads,
      qualifiedLeads,
      closedWonLeads,
      closedLostLeads
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NOVO' } }),
      prisma.lead.count({ where: { status: 'QUALIFICADO' } }),
      prisma.lead.count({ where: { status: 'FECHADO_GANHO' } }),
      prisma.lead.count({ where: { status: 'FECHADO_PERDIDO' } })
    ])

    // Estatísticas de tarefas
    const [
      pendingTasks,
      overdueTasks,
      completedTasksThisMonth
    ] = await Promise.all([
      prisma.task.count({ where: { completed: false } }),
      prisma.task.count({
        where: {
          completed: false,
          dueDate: { lt: new Date() }
        }
      }),
      prisma.task.count({
        where: {
          completed: true,
          updatedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    // Valor total em negociação
    const leadsInNegotiation = await prisma.lead.findMany({
      where: { status: 'NEGOCIACAO' },
      include: { property: true }
    })
    const totalInNegotiation = leadsInNegotiation.reduce(
      (acc, lead) => acc + (lead.property?.price || 0),
      0
    )

    // Leads recentes
    const recentLeads = await prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        property: { select: { title: true, code: true } }
      }
    })

    // Imóveis recentes
    const recentProperties = await prisma.property.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        title: true,
        price: true,
        status: true,
        purpose: true,
        images: true
      }
    })

    // Próximas tarefas
    const upcomingTasks = await prisma.task.findMany({
      where: {
        completed: false,
        dueDate: { gte: new Date() }
      },
      take: 5,
      orderBy: { dueDate: 'asc' },
      include: {
        user: { select: { name: true } }
      }
    })

    // Leads por fonte
    const leadsBySource = await prisma.lead.groupBy({
      by: ['source'],
      _count: true
    })

    return NextResponse.json({
      properties: {
        total: totalProperties,
        available: availableProperties,
        sold: soldProperties,
        rented: rentedProperties,
        featured: featuredProperties
      },
      leads: {
        total: totalLeads,
        new: newLeads,
        qualified: qualifiedLeads,
        closedWon: closedWonLeads,
        closedLost: closedLostLeads,
        bySource: leadsBySource
      },
      tasks: {
        pending: pendingTasks,
        overdue: overdueTasks,
        completedThisMonth: completedTasksThisMonth
      },
      visits: {
        thisMonth: 0
      },
      financial: {
        inNegotiation: totalInNegotiation
      },
      recent: {
        leads: recentLeads,
        properties: recentProperties,
        tasks: upcomingTasks
      }
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}
