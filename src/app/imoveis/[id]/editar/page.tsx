import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PropertyEditContent from './PropertyEditContent'

interface Props {
  params: { id: string }
}

export default async function PropertyEditPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      cityRef: true,
      neighborhoodRef: true
    }
  })

  if (!property) {
    redirect('/imoveis')
  }

  return <PropertyEditContent property={property} user={session.user} />
}
