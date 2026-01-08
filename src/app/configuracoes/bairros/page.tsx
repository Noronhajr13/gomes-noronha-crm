import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import BairrosContent from './BairrosContent'

export const metadata = {
  title: 'Bairros | Configurações | CRM Gomes & Noronha',
  description: 'Gerenciar bairros cadastrados',
}

export default async function BairrosPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return <BairrosContent user={session.user} />
}
