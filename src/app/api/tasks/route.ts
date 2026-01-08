import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tasks - Listar tarefas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}

    // Filtro por usuário (corretor vê só suas tarefas)
    if (session.user.role === 'CORRETOR') {
      where.userId = session.user.id
    } else if (userId) {
      where.userId = userId
    }

    if (status) where.status = status
    if (priority) where.priority = priority

    const tasks = await prisma.task.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' }
      ]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Erro ao listar tarefas:', error)
    return NextResponse.json({ error: 'Erro ao listar tarefas' }, { status: 500 })
  }
}

// POST /api/tasks - Criar tarefa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    const task = await prisma.task.create({
      data: {
        ...data,
        userId: data.userId || session.user.id
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    })

    // Registrar atividade de criação
    await prisma.activity.create({
      data: {
        type: 'TAREFA_CRIADA',
        description: `Tarefa "${task.title}" criada`,
        userId: session.user.id,
        leadId: task.leadId || undefined,
        metadata: { taskId: task.id, taskTitle: task.title }
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 })
  }
}
