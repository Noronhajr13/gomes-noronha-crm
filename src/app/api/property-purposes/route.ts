import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/property-purposes - Lista tipos de negócio (finalidade)
export async function GET() {
  try {
    const result = await prisma.$queryRaw<Array<{ enum_type: string; enum_value: string }>>`
      SELECT
        t.typname as enum_type,
        e.enumlabel as enum_value
      FROM
        pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'PropertyPurpose' AND e.enumlabel <> 'VENDA_ALUGUEL'
      ORDER BY e.enumlabel
    `

    const propertyPurposes = result.map(row => row.enum_value)

    return NextResponse.json({ propertyPurposes })
  } catch (error) {
    console.error('Error fetching property purposes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tipos de negócio' },
      { status: 500 }
    )
  }
}
