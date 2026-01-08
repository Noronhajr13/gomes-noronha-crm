import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Migrar imóveis existentes para vincular com City/Neighborhood
export async function POST() {
  try {
    // Buscar todos os imóveis sem cityId
    const properties = await prisma.property.findMany({
      where: {
        cityId: null
      }
    })

    const results = {
      total: properties.length,
      migrated: 0,
      citiesCreated: 0,
      neighborhoodsCreated: 0,
      errors: [] as string[]
    }

    for (const property of properties) {
      try {
        // Pular se não tiver cidade ou estado
        if (!property.city || !property.state) {
          results.errors.push(`Imóvel ${property.code}: Sem cidade ou estado`)
          continue
        }

        // Encontrar ou criar a cidade
        let city = await prisma.city.findFirst({
          where: {
            name: property.city,
            state: property.state
          }
        })

        if (!city) {
          city = await prisma.city.create({
            data: {
              name: property.city,
              state: property.state,
              active: true
            }
          })
          results.citiesCreated++
        }

        // Encontrar ou criar o bairro (se existir)
        let neighborhoodId: string | null = null
        if (property.neighborhood) {
          let neighborhood = await prisma.neighborhood.findFirst({
            where: {
              name: property.neighborhood,
              cityId: city.id
            }
          })

          if (!neighborhood) {
            neighborhood = await prisma.neighborhood.create({
              data: {
                name: property.neighborhood,
                cityId: city.id,
                active: true
              }
            })
            results.neighborhoodsCreated++
          }
          neighborhoodId = neighborhood.id
        }

        // Atualizar o imóvel com os IDs
        await prisma.property.update({
          where: { id: property.id },
          data: {
            cityId: city.id,
            neighborhoodId: neighborhoodId
          }
        })

        results.migrated++
      } catch (error) {
        results.errors.push(`Imóvel ${property.code}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migração concluída: ${results.migrated}/${results.total} imóveis migrados`,
      results
    })
  } catch (error) {
    console.error('Erro na migração:', error)
    return NextResponse.json(
      { error: 'Erro ao executar migração' },
      { status: 500 }
    )
  }
}

// GET - Verificar status da migração
export async function GET() {
  try {
    const totalProperties = await prisma.property.count()
    const migratedProperties = await prisma.property.count({
      where: {
        cityId: { not: null }
      }
    })
    const pendingProperties = await prisma.property.count({
      where: {
        cityId: null
      }
    })

    const cities = await prisma.city.count()
    const neighborhoods = await prisma.neighborhood.count()

    return NextResponse.json({
      total: totalProperties,
      migrated: migratedProperties,
      pending: pendingProperties,
      cities,
      neighborhoods,
      percentComplete: totalProperties > 0
        ? Math.round((migratedProperties / totalProperties) * 100)
        : 100
    })
  } catch (error) {
    console.error('Erro ao verificar status:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status da migração' },
      { status: 500 }
    )
  }
}
