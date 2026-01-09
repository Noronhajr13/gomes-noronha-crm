import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AttendanceEditContent from './AttendanceEditContent'

interface Props {
  params: { id: string }
}

export default async function AttendanceEditPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      property: {
        select: {
          id: true,
          code: true,
          title: true,
        }
      },
      user: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  })

  if (!lead) {
    redirect('/atendimentos')
  }

  // Get properties for dropdown
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      code: true,
      title: true,
      type: true,
      neighborhoodRef: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get users for dropdown
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: 'asc' },
  })

  return (
    <AttendanceEditContent 
      lead={lead} 
      user={session.user} 
      properties={properties}
      users={users}
    />
  )
}
