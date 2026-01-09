import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AttendanceDetailContent from './AttendanceDetailContent'

interface Props {
  params: { id: string }
}

export default async function AttendanceDetailPage({ params }: Props) {
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
          type: true,
          price: true,
          neighborhoodRef: { select: { id: true, name: true } },
          cityRef: { select: { id: true, name: true, state: true } },
          images: true,
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      visits: {
        orderBy: { scheduledAt: 'desc' },
        take: 5,
      }
    }
  })

  if (!lead) {
    redirect('/atendimentos')
  }

  return <AttendanceDetailContent lead={lead} user={session.user} />
}
