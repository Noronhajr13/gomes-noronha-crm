import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'general'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Construir filtro de data
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    const whereClause = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}

    // Relatório Geral
    if (reportType === 'general') {
      const propertyWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
      const leadWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
      const taskWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
      const visitWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}

      const [
        totalProperties,
        availableProperties,
        soldProperties,
        rentedProperties,
        totalLeads,
        qualifiedLeads,
        closedLeads,
        totalTasks,
        completedTasks,
        totalVisits,
      ] = await Promise.all([
        prisma.property.count({ where: propertyWhere }),
        prisma.property.count({ where: { ...propertyWhere, status: 'DISPONIVEL' } }),
        prisma.property.count({ where: { ...propertyWhere, status: 'VENDIDO' } }),
        prisma.property.count({ where: { ...propertyWhere, status: 'ALUGADO' } }),
        prisma.lead.count({ where: leadWhere }),
        prisma.lead.count({ where: { ...leadWhere, status: 'QUALIFICADO' } }),
        prisma.lead.count({ where: { ...leadWhere, status: 'FECHADO_GANHO' } }),
        prisma.task.count({ where: taskWhere }),
        prisma.task.count({ where: { ...taskWhere, completed: true } }),
        prisma.visit.count({ where: visitWhere }),
      ])

      return NextResponse.json({
        properties: { total: totalProperties, available: availableProperties, sold: soldProperties, rented: rentedProperties },
        leads: { total: totalLeads, qualified: qualifiedLeads, closed: closedLeads },
        tasks: { total: totalTasks, completed: completedTasks },
        visits: { total: totalVisits },
      })
    }

    // Relatório de Vendas
    if (reportType === 'sales') {
      const soldProperties = await prisma.property.findMany({
        where: {
          status: 'VENDIDO',
          ...whereClause,
        },
        select: {
          id: true,
          code: true,
          title: true,
          price: true,
          type: true,
          purpose: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const totalValue = soldProperties.reduce((sum, prop) => sum + prop.price, 0)
      const averageValue = soldProperties.length > 0 ? totalValue / soldProperties.length : 0

      return NextResponse.json({
        sales: soldProperties,
        stats: {
          total: soldProperties.length,
          totalValue,
          averageValue,
        },
      })
    }

    // Relatório de Leads
    if (reportType === 'leads') {
      const leadsData = await prisma.lead.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          source: true,
          budget: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      // Agrupar por status
      const byStatus = leadsData.reduce((acc: any, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1
        return acc
      }, {})

      // Agrupar por origem
      const bySource = leadsData.reduce((acc: any, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1
        return acc
      }, {})

      return NextResponse.json({
        leads: leadsData,
        stats: {
          total: leadsData.length,
          byStatus,
          bySource,
        },
      })
    }

    // Relatório de Performance
    if (reportType === 'performance') {
      const users = await prisma.user.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          role: true,
          _count: {
            select: {
              properties: true,
              leads: true,
              tasks: true,
            },
          },
        },
      })

      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          const [closedLeads, completedTasks] = await Promise.all([
            prisma.lead.count({
              where: {
                userId: user.id,
                status: 'FECHADO_GANHO',
                ...whereClause,
              },
            }),
            prisma.task.count({
              where: {
                userId: user.id,
                completed: true,
                ...whereClause,
              },
            }),
          ])

          return {
            ...user,
            stats: {
              properties: user._count.properties,
              leads: user._count.leads,
              closedLeads,
              tasks: user._count.tasks,
              completedTasks,
            },
          }
        })
      )

      return NextResponse.json({ users: usersWithStats })
    }

    return NextResponse.json({ error: 'Tipo de relatório inválido' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Erro ao buscar relatórios' }, { status: 500 })
  }
}
