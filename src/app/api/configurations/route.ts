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
    const category = searchParams.get('category') || ''

    const where: any = {}
    if (category) {
      where.category = category
    }

    const configurations = await prisma.configuration.findMany({
      where,
      orderBy: { category: 'asc' },
    })

    return NextResponse.json({ configurations })
  } catch (error) {
    console.error('Error fetching configurations:', error)
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    const configuration = await prisma.configuration.create({
      data: {
        key: data.key,
        value: data.value,
        type: data.type || 'STRING',
        category: data.category,
        label: data.label,
        description: data.description,
      },
    })

    return NextResponse.json(configuration, { status: 201 })
  } catch (error) {
    console.error('Error creating configuration:', error)
    return NextResponse.json({ error: 'Erro ao criar configuração' }, { status: 500 })
  }
}
