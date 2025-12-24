import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import ConfigurationsContent from './ConfigurationsContent'

export const metadata = {
  title: 'Configurações | CRM Gomes & Noronha',
  description: 'Configurações do sistema',
}

export default async function ConfigurationsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return <ConfigurationsContent user={session.user} />
}
