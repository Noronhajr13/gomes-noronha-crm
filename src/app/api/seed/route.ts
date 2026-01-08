import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Dados iniciais de bairros (de Juiz de Fora)
const neighborhoodsData = [
  'Alto dos Passos',
  'Bom Pastor',
  'Cascatinha',
  'Centro',
  'Costa Carvalho',
  'Dom Bosco',
  'Granbery',
  'Grajaú',
  'Jardim Glória',
  'Manoel Honório',
  'Paineiras',
  'Santa Helena',
  'Santa Luzia',
  'São Mateus',
  'São Pedro',
  'Teixeiras',
  'Vale do Ipê',
]

// Dados iniciais de comodidades
const amenitiesData = [
  'Piscina',
  'Churrasqueira',
  'Jardim',
  'Playground',
  'Academia',
  'Salão de Festas',
  'Portaria 24h',
  'Elevador',
  'Ar Condicionado',
  'Aquecedor Solar',
  'Varanda/Sacada',
  'Closet',
  'Despensa',
  'Área de Serviço',
  'Quintal',
  'Garagem Coberta',
  'Piso Porcelanato',
  'Armários Embutidos',
  'Cozinha Americana',
  'Interfone',
  'Cerca Elétrica',
  'Câmeras de Segurança',
]

export async function POST() {
  try {
    // Verificar se já existe dados
    const existingCity = await prisma.city.findFirst()
    if (existingCity) {
      return NextResponse.json({
        message: 'Dados já existem. Seed ignorado.',
        seeded: false
      })
    }

    // Criar cidade de Juiz de Fora
    const city = await prisma.city.create({
      data: {
        name: 'Juiz de Fora',
        state: 'MG',
        active: true,
      }
    })

    // Criar bairros vinculados à cidade
    const neighborhoods = await Promise.all(
      neighborhoodsData.map((name, index) =>
        prisma.neighborhood.create({
          data: {
            name,
            cityId: city.id,
            active: true,
            order: index,
          }
        })
      )
    )

    // Criar comodidades
    const amenities = await Promise.all(
      amenitiesData.map((name, index) =>
        prisma.amenity.create({
          data: {
            name,
            active: true,
            order: index,
          }
        })
      )
    )

    return NextResponse.json({
      message: 'Seed concluído com sucesso!',
      seeded: true,
      data: {
        city: city.name,
        neighborhoodsCount: neighborhoods.length,
        amenitiesCount: amenities.length,
      }
    })

  } catch (error) {
    console.error('Erro ao executar seed:', error)
    return NextResponse.json(
      { error: 'Erro ao executar seed', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cities = await prisma.city.count()
    const neighborhoods = await prisma.neighborhood.count()
    const amenities = await prisma.amenity.count()

    return NextResponse.json({
      cities,
      neighborhoods,
      amenities,
      message: cities > 0 ? 'Dados já foram populados' : 'Execute POST para popular os dados'
    })
  } catch (error) {
    console.error('Erro ao verificar seed:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar dados' },
      { status: 500 }
    )
  }
}
