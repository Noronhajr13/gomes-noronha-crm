import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import LeadsContent from './LeadsContent'

export default async function LeadsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <LeadsContent 
      user={{
        name: session.user?.name,
        email: session.user?.email,
        role: (session.user as { role?: string })?.role
      }}
    />
  )
}
