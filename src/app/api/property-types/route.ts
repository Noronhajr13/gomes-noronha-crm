import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/property-types - Lista tipos de imóvel
export async function GET() {
  try {
    const result = await prisma.$queryRaw<Array<{ enum_type: string; enum_value: string }>>`
      SELECT
        t.typname as enum_type,
        e.enumlabel as enum_value
      FROM
        pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'PropertyType'
      ORDER BY e.enumlabel
    `

    const propertyTypes = result.map(row => row.enum_value)

    return NextResponse.json({ propertyTypes })
  } catch (error) {
    console.error('Error fetching property types:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tipos de imóvel' },
      { status: 500 }
    )
  }
}
