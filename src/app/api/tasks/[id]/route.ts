import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tasks/[id] - Buscar tarefa por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    const task = await prisma.task.update({
      where: { id: params.id },
      data,
      include: {
        user: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error)
    return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Deletar tarefa
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await prisma.task.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error)
    return NextResponse.json({ error: 'Erro ao deletar tarefa' }, { status: 500 })
  }
}
