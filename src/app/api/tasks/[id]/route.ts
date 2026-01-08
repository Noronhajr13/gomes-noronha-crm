import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tasks/[id] - Buscar tarefa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error)
    return NextResponse.json({ error: 'Erro ao buscar tarefa' }, { status: 500 })
  }
}

// PUT /api/tasks/[id] - Atualizar tarefa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Buscar tarefa anterior para comparar mudanças
    const previousTask = await prisma.task.findUnique({
      where: { id: params.id }
    })

    // Sincronizar completed e status para manter consistência
    const updateData = { ...data }
    if (data.completed !== undefined) {
      // Se completed mudou, atualizar status correspondente
      if (data.completed === true && data.status === undefined) {
        updateData.status = 'CONCLUIDA'
      } else if (data.completed === false && data.status === undefined) {
        updateData.status = 'PENDENTE'
      }
    } else if (data.status !== undefined) {
      // Se status mudou, atualizar completed correspondente
      updateData.completed = data.status === 'CONCLUIDA'
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true } }
      }
    })

    // Registrar atividade de atualização
    if (previousTask?.status !== task.status) {
      await prisma.activity.create({
        data: {
          type: 'TAREFA_STATUS_ALTERADO',
          description: `Status da tarefa "${task.title}" alterado de ${previousTask?.status} para ${task.status}`,
          userId: session.user.id,
          leadId: task.leadId || undefined,
          metadata: {
            taskId: task.id,
            previousStatus: previousTask?.status,
            newStatus: task.status
          }
        }
      })
    } else {
      await prisma.activity.create({
        data: {
          type: 'TAREFA_ATUALIZADA',
          description: `Tarefa "${task.title}" atualizada`,
          userId: session.user.id,
          leadId: task.leadId || undefined,
          metadata: { taskId: task.id }
        }
      })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error)
    return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Deletar tarefa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar tarefa antes de deletar para registrar atividade
    const task = await prisma.task.findUnique({
      where: { id: params.id }
    })

    await prisma.task.delete({
      where: { id: params.id }
    })

    // Registrar atividade de exclusão
    if (task) {
      await prisma.activity.create({
        data: {
          type: 'TAREFA_EXCLUIDA',
          description: `Tarefa "${task.title}" excluída`,
          userId: session.user.id,
          leadId: task.leadId || undefined,
          metadata: { taskTitle: task.title }
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error)
    return NextResponse.json({ error: 'Erro ao deletar tarefa' }, { status: 500 })
  }
}
