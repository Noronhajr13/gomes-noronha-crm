'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CRMLayout } from '@/components/layout'
import { getEnumLabel, getEnumColor } from '@/lib/enum-labels'
import type { Property } from '@prisma/client'

interface PropertyWithRelations extends Property {
  cityRef?: { id: string; name: string; state: string } | null
  neighborhoodRef?: { id: string; name: string } | null
}

interface Props {
  property: PropertyWithRelations
  user: {
    id?: string
    name?: string | null
    email?: string | null
    role?: string
  }
}

export default function PropertyDetailContent({ property, user }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'history'>('info')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => getEnumColor('PropertyStatus', status)
  const getStatusLabel = (status: string) => getEnumLabel('PropertyStatus', status)
  const getTypeLabel = (type: string) => getEnumLabel('PropertyType', type)
  const getTransactionLabel = (transaction: string) => getEnumLabel('PropertyPurpose', transaction)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/imoveis')
        router.refresh()
      } else {
        alert('Erro ao excluir imóvel')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir imóvel')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const images = property.images || []
  const amenities = property.features || []

  return (
    <CRMLayout title="Detalhes do Imóvel" subtitle={property.title} user={user}>
      {/* Header com ações */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/imoveis"
            className="flex items-center gap-2 text-crm-text-secondary hover:text-crm-text-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
            {getStatusLabel(property.status)}
          </span>
          {property.featured && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
              ⭐ Destaque
            </span>
          )}
          {property.exclusive && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              🔒 Exclusivo
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <Link
            href={`/imoveis/${property.id}/editar`}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA76A] text-white rounded-lg hover:bg-[#C4934F] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Excluir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-crm-border">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'info' 
                ? 'border-[#DDA76A] text-[#DDA76A]' 
                : 'border-transparent text-crm-text-muted hover:text-crm-text-secondary'
            }`}
          >
            Informações
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'photos' 
                ? 'border-[#DDA76A] text-[#DDA76A]' 
                : 'border-transparent text-crm-text-muted hover:text-crm-text-secondary'
            }`}
          >
            Fotos ({images.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'history' 
                ? 'border-[#DDA76A] text-[#DDA76A]' 
                : 'border-transparent text-crm-text-muted hover:text-crm-text-secondary'
            }`}
          >
            Histórico
          </button>
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-crm-bg-surface rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-crm-text-primary">Informações Básicas</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-crm-text-muted">Código</p>
                  <p className="font-medium text-crm-text-primary">{property.code || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-crm-text-muted">Tipo</p>
                  <p className="font-medium text-crm-text-primary">{getTypeLabel(property.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-crm-text-muted">Transação</p>
                  <p className="font-medium text-crm-text-primary">{getTransactionLabel(property.purpose)}</p>
                </div>
                <div>
                  <p className="text-sm text-crm-text-muted">Cadastrado em</p>
                  <p className="font-medium text-crm-text-primary">{formatDate(property.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-crm-bg-surface rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-crm-text-primary">Descrição</h2>
              <p className="text-crm-text-secondary whitespace-pre-line">{property.description || 'Sem descrição'}</p>
            </div>

            {/* Características */}
            <div className="bg-crm-bg-surface rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-crm-text-primary">Características</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-crm-bg-elevated rounded-lg">
                  <div className="w-10 h-10 bg-[#DDA76A]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#DDA76A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-crm-text-muted">Área</p>
                    <p className="font-semibold text-crm-text-primary">{property.area}m²</p>
                  </div>
                </div>
                {property.landArea && (
                  <div className="flex items-center gap-3 p-3 bg-crm-bg-elevated rounded-lg">
                    <div className="w-10 h-10 bg-[#DDA76A]/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#DDA76A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-crm-text-muted">Terreno</p>
                      <p className="font-semibold text-crm-text-primary">{property.landArea}m²</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-crm-bg-elevated rounded-lg">
                  <div className="w-10 h-10 bg-[#DDA76A]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#DDA76A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-crm-text-muted">Quartos</p>
                    <p className="font-semibold text-crm-text-primary">{property.bedrooms}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-crm-bg-elevated rounded-lg">
                  <div className="w-10 h-10 bg-[#DDA76A]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#DDA76A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-crm-text-muted">Banheiros</p>
                    <p className="font-semibold text-crm-text-primary">{property.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-crm-bg-elevated rounded-lg">
                  <div className="w-10 h-10 bg-[#DDA76A]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#DDA76A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-crm-text-muted">Vagas</p>
                    <p className="font-semibold text-crm-text-primary">{property.parkingSpots}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comodidades */}
            {amenities.length > 0 && (
              <div className="bg-crm-bg-surface rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-crm-text-primary">Comodidades</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-crm-bg-hover text-crm-text-secondary rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Endereço */}
            <div className="bg-crm-bg-surface rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-crm-text-primary">Localização</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-crm-text-muted">Endereço</p>
                  <p className="font-medium text-crm-text-primary">
                    {property.address}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-crm-text-muted">Bairro</p>
                  <p className="font-medium text-crm-text-primary">{property.neighborhoodRef?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-crm-text-muted">Cidade/Estado</p>
                  <p className="font-medium text-crm-text-primary">{property.cityRef?.name || '-'} - {property.cityRef?.state || 'MG'}</p>
                </div>
                {property.zipCode && (
                  <div>
                    <p className="text-sm text-crm-text-muted">CEP</p>
                    <p className="font-medium text-crm-text-primary">{property.zipCode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Valores */}
            <div className="bg-crm-bg-surface rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-crm-text-primary">Valores</h2>
              <div className="space-y-4">
                <div className="p-4 bg-[#DDA76A]/10 rounded-lg">
                  <p className="text-sm text-crm-text-muted">
                    {property.purpose === 'ALUGUEL' ? 'Aluguel' : 'Preço'}
                  </p>
                  <p className="text-2xl font-bold text-[#DDA76A]">{formatCurrency(property.price)}</p>
                </div>
              </div>
            </div>

            {/* Imagem Principal */}
            {images.length > 0 && (
              <div className="bg-crm-bg-surface rounded-xl shadow-sm overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={images[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="bg-crm-bg-surface rounded-xl shadow-sm p-6">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <Image
                    src={image}
                    alt={`${property.title} - Foto ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-crm-text-disabled mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-crm-text-muted">Nenhuma foto cadastrada</p>
              <Link
                href={`/imoveis/${property.id}/editar`}
                className="inline-block mt-4 text-[#DDA76A] hover:underline"
              >
                Adicionar fotos
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-crm-bg-surface rounded-xl shadow-sm p-6">
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-crm-text-disabled mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-crm-text-muted">Histórico de atividades em breve</p>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-crm-bg-surface rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirmar Exclusão</h3>
            <p className="text-crm-text-secondary mb-6">
              Tem certeza que deseja excluir o imóvel <strong>{property.title}</strong>? 
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-crm-text-secondary hover:bg-crm-bg-hover rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  )
}
