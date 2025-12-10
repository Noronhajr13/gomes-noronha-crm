'use client'

import { useState } from 'react'
import Link from 'next/link'
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

type TabType = 'info' | 'values' | 'features' | 'address' | 'media' | 'highlights'

const amenitiesList = [
  'Piscina', 'Churrasqueira', 'Salão de Festas', 'Academia', 'Playground',
  'Quadra Esportiva', 'Segurança 24h', 'Portaria', 'Elevador', 'Ar Condicionado',
  'Aquecimento Solar', 'Jardim', 'Varanda', 'Lareira', 'Closet', 'Escritório',
  'Lavanderia', 'Despensa', 'Quarto de Empregada', 'Banheiro de Empregada'
]

export default function PropertyEditContent({ property, user }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Parse initial data
  const initialImages = property.images || []
  const initialAmenities = property.amenities || []

  const [formData, setFormData] = useState({
    // Info
    title: property.title || '',
    description: property.description || '',
    code: property.code || '',
    type: property.type || 'CASA',
    transactionType: property.transactionType || 'VENDA',
    status: property.status || 'DISPONIVEL',
    
    // Values
    price: (property.price * 100).toString() || '',
    condominiumFee: property.condominiumFee ? (property.condominiumFee * 100).toString() : '',
    iptu: property.iptu ? (property.iptu * 100).toString() : '',
    
    // Features
    area: property.area?.toString() || '',
    bedrooms: property.bedrooms?.toString() || '0',
    bathrooms: property.bathrooms?.toString() || '0',
    suites: property.suites?.toString() || '0',
    parking: property.parking?.toString() || '0',
    yearBuilt: property.yearBuilt?.toString() || '',
    amenities: initialAmenities,
    
    // Address
    zipCode: property.zipCode || '',
    address: property.address || '',
    addressNumber: property.addressNumber || '',
    complement: property.complement || '',
    neighborhood: property.neighborhood || '',
    city: property.city || '',
    state: property.state || '',
    
    // Media
    images: initialImages,
    videoUrl: property.videos?.[0] || '',
    virtualTour: property.virtualTour || '',
    
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
      const payload = {
        title: formData.title,
        description: formData.description || null,
        code: formData.code || property.code,
        type: formData.type,
        transactionType: formData.transactionType,
        status: formData.status,
        price: parseCurrency(formData.price),
        condominiumFee: formData.condominiumFee ? parseCurrency(formData.condominiumFee) : null,
        iptu: formData.iptu ? parseCurrency(formData.iptu) : null,
        area: parseFloat(formData.area) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        suites: parseInt(formData.suites) || 0,
        parking: parseInt(formData.parking) || 0,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
        amenities: formData.amenities,
        zipCode: formData.zipCode || null,
        address: formData.address,
        addressNumber: formData.addressNumber || null,
        complement: formData.complement || null,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        images: formData.images,
        videos: formData.videoUrl ? [formData.videoUrl] : [],
        virtualTour: formData.virtualTour || null,
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

  const inputClass = (field: string) => `
    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DDA76A] focus:border-transparent
    ${errors[field] ? 'border-red-500' : 'border-crm-border'}
  `

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
                    <option value="TERRENO">Terreno</option>
                    <option value="SALA_COMERCIAL">Sala Comercial</option>
                    <option value="LOJA">Loja</option>
                    <option value="GALPAO">Galpão</option>
                    <option value="SITIO">Sítio</option>
                    <option value="FAZENDA">Fazenda</option>
                    <option value="KITNET">Kitnet</option>
                    <option value="FLAT">Flat</option>
                    <option value="SOBRADO">Sobrado</option>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Condomínio</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-crm-text-muted">R$</span>
                    <input
                      type="text"
                      value={formatCurrency(formData.condominiumFee)}
                      onChange={(e) => handleInputChange('condominiumFee', e.target.value.replace(/\D/g, ''))}
                      className={`${inputClass('condominiumFee')} pl-12`}
                      placeholder="0,00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">IPTU (anual)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-crm-text-muted">R$</span>
                    <input
                      type="text"
                      value={formatCurrency(formData.iptu)}
                      onChange={(e) => handleInputChange('iptu', e.target.value.replace(/\D/g, ''))}
                      className={`${inputClass('iptu')} pl-12`}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Características */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Área (m²) *</label>
                  <input type="number" value={formData.area} onChange={(e) => handleInputChange('area', e.target.value)} className={inputClass('area')} min="0" step="0.01" />
                  {errors.area && <p className="mt-1 text-sm text-red-500">{errors.area}</p>}
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
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Suítes</label>
                  <input type="number" value={formData.suites} onChange={(e) => handleInputChange('suites', e.target.value)} className={inputClass('suites')} min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Vagas</label>
                  <input type="number" value={formData.parking} onChange={(e) => handleInputChange('parking', e.target.value)} className={inputClass('parking')} min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Ano</label>
                  <input type="number" value={formData.yearBuilt} onChange={(e) => handleInputChange('yearBuilt', e.target.value)} className={inputClass('yearBuilt')} min="1900" max={new Date().getFullYear()} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-3">Comodidades</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {amenitiesList.map(amenity => (
                    <label key={amenity} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${formData.amenities.includes(amenity) ? 'border-[#DDA76A] bg-[#DDA76A]/10' : 'border-crm-border hover:border-crm-border'}`}>
                      <input type="checkbox" checked={formData.amenities.includes(amenity)} onChange={() => handleAmenityToggle(amenity)} className="rounded text-[#DDA76A] focus:ring-[#DDA76A]" />
                      <span className="text-sm text-crm-text-secondary">{amenity}</span>
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
                    <button type="button" onClick={handleCepSearch} className="px-4 py-2 bg-crm-bg-hover text-crm-text-secondary rounded-lg hover:bg-gray-200 transition-colors">Buscar</button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Endereço *</label>
                  <input type="text" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className={inputClass('address')} placeholder="Rua, Avenida..." />
                  {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Número</label>
                  <input type="text" value={formData.addressNumber} onChange={(e) => handleInputChange('addressNumber', e.target.value)} className={inputClass('addressNumber')} placeholder="123" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Complemento</label>
                  <input type="text" value={formData.complement} onChange={(e) => handleInputChange('complement', e.target.value)} className={inputClass('complement')} placeholder="Apto, Bloco..." />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Bairro *</label>
                  <input type="text" value={formData.neighborhood} onChange={(e) => handleInputChange('neighborhood', e.target.value)} className={inputClass('neighborhood')} placeholder="Centro" />
                  {errors.neighborhood && <p className="mt-1 text-sm text-red-500">{errors.neighborhood}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Cidade *</label>
                  <input type="text" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} className={inputClass('city')} placeholder="São Paulo" />
                  {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">Estado *</label>
                  <select value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} className={inputClass('state')}>
                    <option value="">Selecione</option>
                    <option value="AC">Acre</option><option value="AL">Alagoas</option><option value="AP">Amapá</option><option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option><option value="CE">Ceará</option><option value="DF">Distrito Federal</option><option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option><option value="MA">Maranhão</option><option value="MT">Mato Grosso</option><option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option><option value="PA">Pará</option><option value="PB">Paraíba</option><option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option><option value="PI">Piauí</option><option value="RJ">Rio de Janeiro</option><option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option><option value="RO">Rondônia</option><option value="RR">Roraima</option><option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option><option value="SE">Sergipe</option><option value="TO">Tocantins</option>
                  </select>
                  {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Mídia */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-2">Imagens</label>
                <div className="border-2 border-dashed border-crm-border rounded-lg p-8 text-center">
                  <svg className="w-12 h-12 mx-auto text-crm-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-crm-text-muted mb-2">Upload de imagens em breve</p>
                  <p className="text-sm text-crm-text-muted">Arraste e solte ou clique para selecionar</p>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-crm-bg-hover">
                        <img src={img} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-2">URL do Vídeo</label>
                <input type="url" value={formData.videoUrl} onChange={(e) => handleInputChange('videoUrl', e.target.value)} className={inputClass('videoUrl')} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-2">URL do Tour Virtual</label>
                <input type="url" value={formData.virtualTour} onChange={(e) => handleInputChange('virtualTour', e.target.value)} className={inputClass('virtualTour')} placeholder="https://matterport.com/..." />
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
