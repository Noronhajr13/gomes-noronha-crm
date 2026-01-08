'use client'

import { useState, useCallback, useRef } from 'react'
import { uploadPropertyImage, deletePropertyImage } from '@/lib/supabase'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ImageUploadProps {
  propertyCode: string
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

interface SortableImageProps {
  imageUrl: string
  index: number
  onRemove: (imageUrl: string) => void
  onSetPrimary: (imageUrl: string) => void
}

function SortableImage({ imageUrl, index, onRemove, onSetPrimary }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: imageUrl })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group aspect-square rounded-lg overflow-hidden bg-gray-100 ${
        isDragging ? 'shadow-2xl ring-2 ring-[#DDA76A]' : ''
      }`}
    >
      {/* Área de arraste - toda a imagem */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
      />

      <img
        src={imageUrl}
        alt={`Imagem ${index + 1}`}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Overlay com botões */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20 pointer-events-none">
        {index !== 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSetPrimary(imageUrl)
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition-colors pointer-events-auto"
            title="Definir como principal"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(imageUrl)
          }}
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors pointer-events-auto"
          title="Remover imagem"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Badge de principal */}
      {index === 0 && (
        <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1 z-30">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Principal
        </span>
      )}

      {/* Indicador de arraste */}
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
        Arraste
      </div>
    </div>
  )
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Precisa arrastar 8px para iniciar o drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string)
      const newIndex = images.indexOf(over.id as string)
      const newImages = arrayMove(images, oldIndex, newIndex)
      onChange(newImages)
    }
  }, [images, onChange])

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

  const handleSetPrimary = useCallback((imageUrl: string) => {
    // Move a imagem selecionada para a primeira posição
    const newImages = [imageUrl, ...images.filter(img => img !== imageUrl)]
    onChange(newImages)
  }, [images, onChange])

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
            ? 'border-[#DDA76A] bg-[#DDA76A]/10'
            : 'border-crm-border hover:border-[#DDA76A] hover:bg-crm-bg-hover'
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
          <div className="mx-auto w-12 h-12 text-crm-text-muted">
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
              <p className="text-sm text-crm-text-secondary">Enviando imagens...</p>
              <div className="w-full bg-crm-bg-elevated rounded-full h-2">
                <div
                  className="bg-[#DDA76A] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-crm-text-muted">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-crm-text-secondary">
                <span className="font-semibold text-[#DDA76A]">Clique para selecionar</span>
                {' '}ou arraste imagens aqui
              </p>
              <p className="text-xs text-crm-text-muted">
                PNG, JPG, WEBP até 5MB cada • Máximo {maxImages} imagens
              </p>
            </>
          )}
        </div>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-300 hover:text-red-200 font-medium"
          >
            ✕
          </button>
        </div>
      )}

      {/* Preview das Imagens com Drag & Drop */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-crm-text-secondary">
              {images.length} imagem{images.length !== 1 ? 's' : ''} selecionada{images.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-crm-text-muted">
              Arraste para reordenar • A primeira imagem é a principal
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((imageUrl, index) => (
                  <SortableImage
                    key={imageUrl}
                    imageUrl={imageUrl}
                    index={index}
                    onRemove={handleRemoveImage}
                    onSetPrimary={handleSetPrimary}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}
