'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CRMLayout } from '@/components/layout'
import type { Property } from '@prisma/client'

interface Props {
  property: Property
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DISPONIVEL': return 'bg-green-100 text-green-800'
      case 'VENDIDO': return 'bg-blue-100 text-blue-800'
      case 'ALUGADO': return 'bg-purple-100 text-purple-800'
      case 'RESERVADO': return 'bg-yellow-100 text-yellow-800'
      case 'INATIVO': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DISPONIVEL': return 'Disponível'
      case 'VENDIDO': return 'Vendido'
      case 'ALUGADO': return 'Alugado'
      case 'RESERVADO': return 'Reservado'
      case 'INATIVO': return 'Inativo'
      default: return status
    }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'CASA': 'Casa',
      'APARTAMENTO': 'Apartamento',
      'COBERTURA': 'Cobertura',
      'TERRENO': 'Terreno',
      'SALA_COMERCIAL': 'Sala Comercial',
      'LOJA': 'Loja',
      'GALPAO': 'Galpão',
      'SITIO': 'Sítio',
      'FAZENDA': 'Fazenda',
      'KITNET': 'Kitnet',
      'FLAT': 'Flat',
      'SOBRADO': 'Sobrado',
    }
    return types[type] || type
  }

  const getTransactionLabel = (transaction: string) => {
    switch (transaction) {
      case 'VENDA': return 'Venda'
      case 'ALUGUEL': return 'Aluguel'
      case 'VENDA_ALUGUEL': return 'Venda ou Aluguel'
      default: return transaction
    }
  }

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
  const amenities = property.amenities || []

  return (
    <CRMLayout title="Detalhes do Imóvel" subtitle={property.title} user={user}>
      {/* Header com ações */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/imoveis"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
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
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'info' 
                ? 'border-[#DDA76A] text-[#DDA76A]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Informações
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'photos' 
                ? 'border-[#DDA76A] text-[#DDA76A]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Fotos ({images.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'history' 
                ? 'border-[#DDA76A] text-[#DDA76A]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Informações Básicas</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Código</p>
                  <p className="font-medium text-gray-800">{property.code || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-medium text-gray-800">{getTypeLabel(property.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transação</p>
                  <p className="font-medium text-gray-800">{getTransactionLabel(property.transactionType)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cadastrado em</p>
                  <p className="font-medium text-gray-800">{formatDate(property.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Descrição</h2>
              <p className="text-gray-600 whitespace-pre-line">{property.description || 'Sem descrição'}</p>
            </div>

            {/* Características */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Características</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-[#DDA76A]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#DDA76A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Área</p>
                    <p className="font-semibold text-gray-800">{property.area}m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-[#DDA76A]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#DDA76A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quartos</p>
                    <p className="font-semibold text-gray-800">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-[#DDA76A]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#DDA76A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Suítes</p>
                    <p className="font-semibold text-gray-800">{property.suites}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-[#DDA76A]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#DDA76A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Banheiros</p>
                    <p className="font-semibold text-gray-800">{property.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-[#DDA76A]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#DDA76A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vagas</p>
                    <p className="font-semibold text-gray-800">{property.parking}</p>
                  </div>
                </div>
                {property.yearBuilt && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-[#DDA76A]/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#DDA76A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ano</p>
                      <p className="font-semibold text-gray-800">{property.yearBuilt}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comodidades */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Comodidades</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Endereço */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Localização</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Endereço</p>
                  <p className="font-medium text-gray-800">
                    {property.address}
                    {property.addressNumber && `, ${property.addressNumber}`}
                    {property.complement && ` - ${property.complement}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bairro</p>
                  <p className="font-medium text-gray-800">{property.neighborhood}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cidade/Estado</p>
                  <p className="font-medium text-gray-800">{property.city} - {property.state}</p>
                </div>
                {property.zipCode && (
                  <div>
                    <p className="text-sm text-gray-500">CEP</p>
                    <p className="font-medium text-gray-800">{property.zipCode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Valores */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Valores</h2>
              <div className="space-y-4">
                <div className="p-4 bg-[#DDA76A]/10 rounded-lg">
                  <p className="text-sm text-gray-500">
                    {property.transactionType === 'ALUGUEL' ? 'Aluguel' : 'Preço'}
                  </p>
                  <p className="text-2xl font-bold text-[#DDA76A]">{formatCurrency(property.price)}</p>
                </div>
                {property.condominiumFee && (
                  <div>
                    <p className="text-sm text-gray-500">Condomínio</p>
                    <p className="font-semibold text-gray-800">{formatCurrency(property.condominiumFee)}</p>
                  </div>
                )}
                {property.iptu && (
                  <div>
                    <p className="text-sm text-gray-500">IPTU (anual)</p>
                    <p className="font-semibold text-gray-800">{formatCurrency(property.iptu)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Imagem Principal */}
            {images.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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

            {/* Tour Virtual */}
            {property.virtualTour && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Tour Virtual</h2>
                <a 
                  href={property.virtualTour}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#DDA76A] hover:underline"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Acessar Tour Virtual
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
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
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">Nenhuma foto cadastrada</p>
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">Histórico de atividades em breve</p>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o imóvel <strong>{property.title}</strong>? 
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
