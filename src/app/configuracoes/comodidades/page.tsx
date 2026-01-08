import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import ComodidadesContent from './ComodidadesContent'

export const metadata = {
  title: 'Comodidades | Configurações | CRM Gomes & Noronha',
  description: 'Gerenciar comodidades cadastradas',
}

export default async function ComodidadesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return <ComodidadesContent user={session.user} />
}
