import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import PropertyFormContent from './PropertyFormContent'

export const metadata = {
  title: 'Novo Imóvel'
}

export default async function NewPropertyPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return <PropertyFormContent user={session.user} />
}
