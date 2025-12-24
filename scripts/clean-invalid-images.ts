/**
 * Script para limpar URLs de imagens inválidas dos imóveis
 * Execução: npx tsx scripts/clean-invalid-images.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

async function cleanInvalidImages() {
  console.log('🔍 Buscando imóveis com imagens...\n')

  const properties = await prisma.property.findMany({
    where: {
      images: {
        isEmpty: false
      }
    },
    select: {
      id: true,
      code: true,
      title: true,
      images: true
    }
  })

  console.log(`📦 Encontrados ${properties.length} imóveis com imagens\n`)

  let totalRemoved = 0
  let totalKept = 0

  for (const property of properties) {
    console.log(`\n🏠 Verificando: ${property.code} - ${property.title}`)
    console.log(`   Imagens cadastradas: ${property.images.length}`)

    const validImages: string[] = []
    const invalidImages: string[] = []

    for (const imageUrl of property.images) {
      const exists = await checkImageExists(imageUrl)
      if (exists) {
        validImages.push(imageUrl)
        console.log(`   ✅ Válida: ${imageUrl.substring(0, 60)}...`)
      } else {
        invalidImages.push(imageUrl)
        console.log(`   ❌ Inválida: ${imageUrl.substring(0, 60)}...`)
      }
    }

    if (invalidImages.length > 0) {
      await prisma.property.update({
        where: { id: property.id },
        data: { images: validImages }
      })
      console.log(`   🗑️  Removidas ${invalidImages.length} imagens inválidas`)
      totalRemoved += invalidImages.length
    }

    totalKept += validImages.length
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✨ Limpeza concluída!`)
  console.log(`   Imagens mantidas: ${totalKept}`)
  console.log(`   Imagens removidas: ${totalRemoved}`)
  console.log('='.repeat(50))
}

cleanInvalidImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
