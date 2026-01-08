import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import CidadesContent from './CidadesContent'

export const metadata = {
  title: 'Cidades | Configurações | CRM Gomes & Noronha',
  description: 'Gerenciar cidades cadastradas',
}

export default async function CidadesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return <CidadesContent user={session.user} />
}
