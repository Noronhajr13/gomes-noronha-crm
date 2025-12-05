import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AttendanceFormContent from './AttendanceFormContent'

export default async function NewAttendancePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  // Get properties for dropdown
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      code: true,
      title: true,
      type: true,
      neighborhood: true,
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
    <AttendanceFormContent 
      user={session.user} 
      properties={properties}
      users={users}
    />
  )
}
