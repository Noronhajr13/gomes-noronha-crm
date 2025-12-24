import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Nome do bucket para imagens de imóveis
export const PROPERTY_IMAGES_BUCKET = 'property-images'

// Função para fazer upload de imagem
export async function uploadPropertyImage(
  file: File,
  propertyCode: string
): Promise<{ url: string; error: string | null }> {
  try {
    // Gera nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileName = `${propertyCode}/${timestamp}-${randomString}.${fileExt}`

    // Faz upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Erro no upload:', error)
      return { url: '', error: error.message }
    }

    // Retorna a URL pública da imagem
    const { data: urlData } = supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl, error: null }
  } catch (err) {
    console.error('Erro ao fazer upload:', err)
    return { url: '', error: 'Erro ao fazer upload da imagem' }
  }
}

// Função para deletar uma imagem
export async function deletePropertyImage(
  imageUrl: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Extrai o path da URL
    const urlParts = imageUrl.split(`${PROPERTY_IMAGES_BUCKET}/`)
    if (urlParts.length < 2) {
      return { success: false, error: 'URL inválida' }
    }
    
    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Erro ao deletar:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('Erro ao deletar imagem:', err)
    return { success: false, error: 'Erro ao deletar imagem' }
  }
}

// Função para listar imagens de um imóvel
export async function listPropertyImages(
  propertyCode: string
): Promise<{ urls: string[]; error: string | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .list(propertyCode)

    if (error) {
      console.error('Erro ao listar:', error)
      return { urls: [], error: error.message }
    }

    const urls = data.map(file => {
      const { data: urlData } = supabase.storage
        .from(PROPERTY_IMAGES_BUCKET)
        .getPublicUrl(`${propertyCode}/${file.name}`)
      return urlData.publicUrl
    })

    return { urls, error: null }
  } catch (err) {
    console.error('Erro ao listar imagens:', err)
    return { urls: [], error: 'Erro ao listar imagens' }
  }
}
