import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import ReportsContent from './ReportsContent'

export const metadata = {
  title: 'Relatórios | CRM Gomes & Noronha',
  description: 'Relatórios e análises do CRM',
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return <ReportsContent user={session.user} />
}
