import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AttendancesListContent from './AttendancesListContent'

export default async function AttendancesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return <AttendancesListContent user={session.user} />
}
