'use client'

import { useState, useCallback, useRef } from 'react'
import { uploadPropertyImage, deletePropertyImage } from '@/lib/supabase'

interface ImageUploadProps {
  propertyCode: string
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({
  propertyCode,
  images,
  onChange,
  maxImages = 20
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // Verifica limite de imagens
    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      setError(`Máximo de ${maxImages} imagens permitido`)
      return
    }

    // Filtra apenas imagens
    const imageFiles = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, remainingSlots)

    if (imageFiles.length === 0) {
      setError('Por favor, selecione apenas arquivos de imagem')
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    const newImages: string[] = []
    const totalFiles = imageFiles.length

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      
      // Verifica tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`Arquivo ${file.name} excede o limite de 5MB`)
        continue
      }

      const { url, error: uploadError } = await uploadPropertyImage(file, propertyCode)
      
      if (uploadError) {
        setError(uploadError)
        continue
      }

      if (url) {
        newImages.push(url)
      }

      setUploadProgress(Math.round(((i + 1) / totalFiles) * 100))
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages])
    }

    setUploading(false)
    setUploadProgress(0)
  }, [images, maxImages, onChange, propertyCode])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleRemoveImage = useCallback(async (imageUrl: string) => {
    const { success, error: deleteError } = await deletePropertyImage(imageUrl)
    
    if (!success && deleteError) {
      setError(deleteError)
      return
    }

    onChange(images.filter(img => img !== imageUrl))
  }, [images, onChange])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // Reset input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFiles])

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
          
          {uploading ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Enviando imagens...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">Clique para selecionar</span>
                {' '}ou arraste imagens aqui
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WEBP até 5MB cada • Máximo {maxImages} imagens
              </p>
            </>
          )}
        </div>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-800 hover:text-red-900 font-medium"
          >
            ✕
          </button>
        </div>
      )}

      {/* Preview das Imagens */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {images.length} imagem{images.length !== 1 ? 's' : ''} selecionada{images.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((imageUrl, index) => (
              <div 
                key={imageUrl} 
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={imageUrl}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage(imageUrl)
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                    title="Remover imagem"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
