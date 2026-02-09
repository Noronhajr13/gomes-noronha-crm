import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ALLOWED_ENUMS = [
  'PropertyType',
  'PropertyPurpose',
  'PropertyStatus',
  'LeadSource',
  'LeadStatus',
  'TaskStatus',
  'TaskType',
  'TaskPriority',
  'DocumentType',
]

export async function GET(
  request: NextRequest,
  { params }: { params: { enumName: string } }
) {
  try {
    const { enumName } = params

    if (!ALLOWED_ENUMS.includes(enumName)) {
      return NextResponse.json(
        { error: `Enum '${enumName}' não permitido` },
        { status: 400 }
      )
    }

    const result = await prisma.$queryRaw<Array<{ enum_value: string }>>`
      SELECT e.enumlabel as enum_value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = ${enumName}
      ORDER BY e.enumsortorder
    `

    const values = result.map(row => row.enum_value)

    return NextResponse.json({ values })
  } catch (error) {
    console.error('Error fetching enum values:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar valores do enum' },
      { status: 500 }
    )
  }
}
