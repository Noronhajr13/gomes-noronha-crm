'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CRMLayout } from '@/components/layout'
import type { Property } from '@prisma/client'
import { formStyles, getInputClassName, getSelectClassName, getTextareaClassName } from '@/components/ui/form-elements'
import { ImageUpload } from '@/components/ui/image-upload'

interface Props {
  property: Property
  user: {
    id?: string
    name?: string | null
    email?: string | null
    role?: string
  }
}

interface City {
  id: string
  name: string
  state: string
}

interface Neighborhood {
  id: string
  name: string
  cityId: string
}

interface Amenity {
  id: string
  name: string
}

type TabType = 'info' | 'values' | 'features' | 'address' | 'media' | 'highlights'

export default function PropertyEditContent({ property, user }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Estados para dados dinâmicos
  const [cities, setCities] = useState<City[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([])
  const [selectedCityId, setSelectedCityId] = useState<string>('')

  // Parse initial data
  const initialImages = property.images || []
  const initialAmenities = property.features || []

  const [formData, setFormData] = useState({
    // Info
    title: property.title || '',
    description: property.description || '',
    code: property.code || '',
    type: property.type || 'CASA',
    transactionType: property.purpose || 'VENDA',
    status: property.status || 'DISPONIVEL',
    
    // Values
    price: (property.price * 100).toString() || '',
    
    // Features
    area: property.area?.toString() || '',
    landArea: property.landArea?.toString() || '',
    bedrooms: property.bedrooms?.toString() || '0',
    bathrooms: property.bathrooms?.toString() || '0',
    parking: property.parkingSpots?.toString() || '0',
    amenities: initialAmenities,
    
    // Address
    zipCode: property.zipCode || '',
    address: property.address || '',
    neighborhood: property.neighborhood || '',
    city: property.city || '',
    state: property.state || '',
    
    // Media
    images: initialImages,
    
    // Highlights
    featured: property.featured || false,
    exclusive: property.exclusive || false,
  })

  const tabs = [
    { id: 'info' as TabType, label: 'Informações' },
    { id: 'values' as TabType, label: 'Valores' },
    { id: 'features' as TabType, label: 'Características' },
    { id: 'address' as TabType, label: 'Endereço' },
    { id: 'media' as TabType, label: 'Mídia' },
    { id: 'highlights' as TabType, label: 'Destaques' },
  ]

  // Buscar cidades
  const fetchCities = useCallback(async () => {
    try {
      const res = await fetch('/api/cities')
      const data = await res.json()
      setCities(data.cities || [])
      // Encontrar cidade do imóvel
      const propertyCity = data.cities?.find((c: City) => c.name === property.city && c.state === property.state)
      if (propertyCity) {
        setSelectedCityId(propertyCity.id)
      }
    } catch (error) {
      console.error('Erro ao buscar cidades:', error)
    }
  }, [property.city, property.state])

  // Buscar bairros por cidade
  const fetchNeighborhoods = useCallback(async (cityId: string) => {
    if (!cityId) return
    try {
      const res = await fetch(`/api/neighborhoods?cityId=${cityId}`)
      const data = await res.json()
      setNeighborhoods(data.neighborhoods || [])
    } catch (error) {
      console.error('Erro ao buscar bairros:', error)
    }
  }, [])

  // Buscar comodidades
  const fetchAmenities = useCallback(async () => {
    try {
      const res = await fetch('/api/amenities')
      const data = await res.json()
      setAmenitiesList(data.amenities || [])
    } catch (error) {
      console.error('Erro ao buscar comodidades:', error)
    }
  }, [])

  // Carregar dados iniciais
  useEffect(() => {
    fetchCities()
    fetchAmenities()
  }, [fetchCities, fetchAmenities])

  // Carregar bairros quando cidade mudar
  useEffect(() => {
    if (selectedCityId) {
      fetchNeighborhoods(selectedCityId)
    }
  }, [selectedCityId, fetchNeighborhoods])

  // Atualizar cidade/estado no formData quando mudar seleção
  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId)
    const city = cities.find(c => c.id === cityId)
    if (city) {
      setFormData(prev => ({
        ...prev,
        city: city.name,
        state: city.state,
        neighborhood: '' // Limpar bairro ao trocar cidade
      }))
    }
  }

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    if (!numericValue) return ''
    const number = parseInt(numericValue) / 100
    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const parseCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    if (!numericValue) return 0
    return parseInt(numericValue) / 100
  }

  const handleCepSearch = async () => {
    const cep = formData.zipCode.replace(/\D/g, '')
    if (cep.length !== 8) return

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    }
  }

  const handleAmenityToggle = (amenity: string) => {
    const current = formData.amenities
    if (current.includes(amenity)) {
      handleInputChange('amenities', current.filter(a => a !== amenity))
    } else {
      handleInputChange('amenities', [...current, amenity])
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }
    if (!formData.price) {
      newErrors.price = 'Preço é obrigatório'
    }
    if (!formData.area) {
      newErrors.area = 'Área é obrigatória'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório'
    }
    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória'
    }
    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      if (errors.title) setActiveTab('info')
      else if (errors.price) setActiveTab('values')
      else if (errors.area) setActiveTab('features')
      else if (errors.address || errors.neighborhood || errors.city || errors.state) setActiveTab('address')
      return
    }

    setIsSubmitting(true)

    try {
      // Encontrar o neighborhoodId baseado no nome selecionado
      const selectedNeighborhood = neighborhoods.find(n => n.name === formData.neighborhood)

      const payload = {
        title: formData.title,
        description: formData.description || null,
        code: formData.code || property.code,
        type: formData.type,
        purpose: formData.transactionType,
        status: formData.status,
        price: parseCurrency(formData.price),
        area: parseFloat(formData.area) || 0,
        landArea: formData.landArea ? parseFloat(formData.landArea) : null,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        parkingSpots: parseInt(formData.parking) || 0,
        features: formData.amenities,
        zipCode: formData.zipCode || null,
        address: formData.address,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        cityId: selectedCityId || null,
        neighborhoodId: selectedNeighborhood?.id || null,
        images: formData.images,
        featured: formData.featured,
        exclusive: formData.exclusive,
      }

      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push(`/imoveis/${property.id}`)
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao atualizar imóvel')
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      alert('Erro ao atualizar imóvel')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = (field: string) => getInputClassName(!!errors[field]) // Usando estilos padronizados

  return (
    <CRMLayout title="Editar Imóvel" subtitle={property.title} user={user}>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link 
          href={`/imoveis/${property.id}`}
          className="flex items-center gap-2 text-crm-text-secondary hover:text-crm-text-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/imoveis/${property.id}`)}
            className="px-6 py-2 border border-crm-border text-crm-text-secondary rounded-lg hover:bg-crm-bg-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-[#DDA76A] text-white rounded-lg hover:bg-[#C4934F] disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-crm-bg-surface rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-crm-border">
          <nav className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#DDA76A] text-[#DDA76A]'
                    : 'border-transparent text-crm-text-muted hover:text-crm-text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Informações */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-2">Título do Imóvel *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={inputClass('title')}
                  placeholder="Ex: Casa de 3 quartos no Centro"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-2">Código do Imóvel</label>
                <input type="text" value={formData.code} disabled className={`${inputClass('code')} bg-crm-bg-elevated`} />
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={inputClass('description')}
                  rows={5}
                  placeholder="Descreva os detalhes do imóvel..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Tipo do Imóvel</label>
                  <select value={formData.type} onChange={(e) => handleInputChange('type', e.target.value)} className={inputClass('type')}>
                    <option value="CASA">Casa</option>
                    <option value="APARTAMENTO">Apartamento</option>
                    <option value="COBERTURA">Cobertura</option>
                    <option value="KITNET">Kitnet</option>
                    <option value="FLAT">Flat</option>
                    <option value="SOBRADO">Sobrado</option>
                    <option value="TERRENO">Terreno</option>
                    <option value="COMERCIAL">Comercial</option>
                    <option value="SALA_COMERCIAL">Sala Comercial</option>
                    <option value="LOJA">Loja</option>
                    <option value="GALPAO">Galpão</option>
                    <option value="RURAL">Rural</option>
                    <option value="SITIO">Sítio</option>
                    <option value="FAZENDA">Fazenda</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Tipo de Transação</label>
                  <select value={formData.transactionType} onChange={(e) => handleInputChange('transactionType', e.target.value)} className={inputClass('transactionType')}>
                    <option value="VENDA">Venda</option>
                    <option value="ALUGUEL">Aluguel</option>
                    <option value="VENDA_ALUGUEL">Venda ou Aluguel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Status</label>
                  <select value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} className={inputClass('status')}>
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="RESERVADO">Reservado</option>
                    <option value="VENDIDO">Vendido</option>
                    <option value="ALUGADO">Alugado</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Valores */}
          {activeTab === 'values' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                  {formData.transactionType === 'ALUGUEL' ? 'Valor do Aluguel *' : 'Preço de Venda *'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-crm-text-muted">R$</span>
                  <input
                    type="text"
                    value={formatCurrency(formData.price)}
                    onChange={(e) => handleInputChange('price', e.target.value.replace(/\D/g, ''))}
                    className={`${inputClass('price')} pl-12`}
                    placeholder="0,00"
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
              </div>
            </div>
          )}

          {/* Tab: Características */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Área (m²) *</label>
                  <input type="number" value={formData.area} onChange={(e) => handleInputChange('area', e.target.value)} className={inputClass('area')} min="0" step="0.01" />
                  {errors.area && <p className="mt-1 text-sm text-red-500">{errors.area}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Área Terreno (m²)</label>
                  <input type="number" value={formData.landArea} onChange={(e) => handleInputChange('landArea', e.target.value)} className={inputClass('landArea')} min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Quartos</label>
                  <input type="number" value={formData.bedrooms} onChange={(e) => handleInputChange('bedrooms', e.target.value)} className={inputClass('bedrooms')} min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Banheiros</label>
                  <input type="number" value={formData.bathrooms} onChange={(e) => handleInputChange('bathrooms', e.target.value)} className={inputClass('bathrooms')} min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Vagas</label>
                  <input type="number" value={formData.parking} onChange={(e) => handleInputChange('parking', e.target.value)} className={inputClass('parking')} min="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-3">Comodidades</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {amenitiesList.map(amenity => (
                    <label key={amenity.id} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${formData.amenities.includes(amenity.name) ? 'border-[#DDA76A] bg-[#DDA76A]/10' : 'border-crm-border hover:border-crm-border'}`}>
                      <input type="checkbox" checked={formData.amenities.includes(amenity.name)} onChange={() => handleAmenityToggle(amenity.name)} className="rounded text-[#DDA76A] focus:ring-[#DDA76A]" />
                      <span className="text-sm text-crm-text-secondary">{amenity.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Endereço */}
          {activeTab === 'address' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">CEP</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 8))} className={`${inputClass('zipCode')} flex-1`} placeholder="00000-000" maxLength={9} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Endereço *</label>
                  <input type="text" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className={inputClass('address')} placeholder="Rua, Avenida..." />
                  {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Cidade *</label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className={inputClass('city')}
                  >
                    <option value="">Selecione a cidade</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name} - {city.state}
                      </option>
                    ))}
                  </select>
                  {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                  {!selectedCityId && formData.city && (
                    <p className="mt-1 text-xs text-amber-500">
                      Cidade atual: {formData.city} - {formData.state} (não cadastrada)
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Bairro *</label>
                  {neighborhoods.length > 0 ? (
                    <select
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      className={inputClass('neighborhood')}
                    >
                      <option value="">Selecione o bairro</option>
                      {neighborhoods.map(n => (
                        <option key={n.id} value={n.name}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      className={inputClass('neighborhood')}
                      placeholder="Digite o bairro"
                    />
                  )}
                  {errors.neighborhood && <p className="mt-1 text-sm text-red-500">{errors.neighborhood}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Estado *</label>
                  <input
                    type="text"
                    value={formData.state}
                    readOnly
                    className={`${inputClass('state')} bg-crm-bg-elevated cursor-not-allowed`}
                    placeholder="Selecione a cidade"
                  />
                  {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Mídia */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-2">Imagens do Imóvel</label>
                <p className="text-xs text-crm-text-muted mb-4">
                  Arraste e solte as imagens ou clique para selecionar. Recomendamos pelo menos 5 fotos.
                </p>
                
                <ImageUpload
                  propertyCode={property.code || property.id}
                  images={formData.images}
                  onChange={(newImages) => handleInputChange('images', newImages)}
                  maxImages={20}
                />
              </div>
            </div>
          )}

          {/* Tab: Destaques */}
          {activeTab === 'highlights' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-crm-bg-elevated rounded-lg">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.featured} onChange={(e) => handleInputChange('featured', e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DDA76A]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-crm-bg-surface after:border-crm-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DDA76A]"></div>
                </label>
                <div>
                  <h3 className="font-medium text-crm-text-primary">⭐ Imóvel em Destaque</h3>
                  <p className="text-sm text-crm-text-muted">Este imóvel aparecerá em destaque no site</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-crm-bg-elevated rounded-lg">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.exclusive} onChange={(e) => handleInputChange('exclusive', e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DDA76A]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-crm-bg-surface after:border-crm-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DDA76A]"></div>
                </label>
                <div>
                  <h3 className="font-medium text-crm-text-primary">🔒 Imóvel Exclusivo</h3>
                  <p className="text-sm text-crm-text-muted">Este imóvel é exclusivo da Gomes &amp; Noronha</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CRMLayout>
  )
}
