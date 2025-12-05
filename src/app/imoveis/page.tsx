import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import PropertiesListContent from './PropertiesListContent'

export const metadata = {
  title: 'Imóveis'
}

export default async function PropertiesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return <PropertiesListContent user={session.user} />
}
