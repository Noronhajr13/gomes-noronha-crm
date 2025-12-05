import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PropertyDetailContent from './PropertyDetailContent'

interface Props {
  params: { id: string }
}

export default async function PropertyDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const property = await prisma.property.findUnique({
    where: { id: params.id }
  })

  if (!property) {
    redirect('/imoveis')
  }

  return <PropertyDetailContent property={property} user={session.user} />
}
