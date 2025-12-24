import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DocumentsContent from './DocumentsContent'

export const metadata = {
  title: 'Documentos | CRM Gomes & Noronha',
  description: 'Gestão de documentos do CRM',
}

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return <DocumentsContent user={session.user} />
}
