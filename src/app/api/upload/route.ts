import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const propertyCode = formData.get('propertyCode') as string

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo inválido. Use JPG, PNG ou WEBP' }, { status: 400 })
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB)' }, { status: 400 })
    }

    // Criar diretório
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'properties', propertyCode)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Nome único
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
    const filePath = join(uploadDir, fileName)

    // Salvar
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // URL pública
    const url = `/uploads/properties/${propertyCode}/${fileName}`

    return NextResponse.json({ url }, { status: 201 })
  } catch (error: any) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL não fornecida' }, { status: 400 })
    }

    const filePath = join(process.cwd(), 'public', imageUrl)
    await unlink(filePath)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar:', error)
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 })
  }
}
