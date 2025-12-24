export async function uploadPropertyImage(
  file: File,
  propertyCode: string
): Promise<{ url: string; error: string | null }> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('propertyCode', propertyCode)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const data = await response.json()
      return { url: '', error: data.error || 'Erro ao fazer upload' }
    }

    const data = await response.json()
    return { url: data.url, error: null }
  } catch (error: any) {
    return { url: '', error: error.message || 'Erro ao fazer upload' }
  }
}

export async function deletePropertyImage(
  imageUrl: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const data = await response.json()
      return { success: false, error: data.error || 'Erro ao deletar' }
    }

    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao deletar' }
  }
}

export async function listPropertyImages(
  propertyCode: string
): Promise<{ urls: string[]; error: string | null }> {
  // Não necessário - imagens gerenciadas no estado do componente
  return { urls: [], error: null }
}
