import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TasksListContent from './TasksListContent'

export default async function TasksPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  // Busca tarefas
  const where: Record<string, unknown> = {}
  
  // Corretor vê só suas tarefas
  if (session.user.role === 'CORRETOR') {
    where.userId = session.user.id
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    },
    orderBy: [
      { completed: 'asc' },
      { dueDate: 'asc' },
      { priority: 'desc' }
    ]
  })

  // Busca usuários para filtro
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: 'asc' }
  })

  return <TasksListContent tasks={tasks} users={users} user={session.user} />
}
