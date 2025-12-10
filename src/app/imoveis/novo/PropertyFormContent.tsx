'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CRMLayout from '@/components/layout/CRMLayout'
import {
  ArrowLeft,
  Save,
  Building2,
  DollarSign,
  MapPin,
  Image as ImageIcon,
  Sparkles,
  Info,
  X,
  Upload,
  Loader2,
  Check,
  Plus,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertyFormContentProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

interface FormData {
  title: string
  description: string
  type: string
  transactionType: string
  status: string
  price: string
  condominiumFee: string
  iptu: string
  area: string
  bedrooms: string
  bathrooms: string
  suites: string
  parking: string
  yearBuilt: string
  address: string
  addressNumber: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  amenities: string[]
  featured: boolean
  exclusive: boolean
}

const initialFormData: FormData = {
  title: '',
  description: '',
  type: 'CASA',
  transactionType: 'VENDA',
  status: 'DISPONIVEL',
  price: '',
  condominiumFee: '',
  iptu: '',
  area: '',
  bedrooms: '0',
  bathrooms: '0',
  suites: '0',
  parking: '0',
  yearBuilt: '',
  address: '',
  addressNumber: '',
  complement: '',
  neighborhood: '',
  city: 'Juiz de Fora',
  state: 'MG',
  zipCode: '',
  amenities: [],
  featured: false,
  exclusive: false
}

const propertyTypes = [
  { value: 'CASA', label: 'Casa' },
  { value: 'APARTAMENTO', label: 'Apartamento' },
  { value: 'COBERTURA', label: 'Cobertura' },
  { value: 'TERRENO', label: 'Terreno' },
  { value: 'SALA_COMERCIAL', label: 'Sala Comercial' },
  { value: 'LOJA', label: 'Loja' },
  { value: 'GALPAO', label: 'Galpão' },
  { value: 'SITIO', label: 'Sítio' },
  { value: 'FAZENDA', label: 'Fazenda' },
  { value: 'KITNET', label: 'Kitnet' },
  { value: 'FLAT', label: 'Flat' },
  { value: 'SOBRADO', label: 'Sobrado' },
]

const transactionTypes = [
  { value: 'VENDA', label: 'Venda' },
  { value: 'ALUGUEL', label: 'Aluguel' },
  { value: 'VENDA_ALUGUEL', label: 'Venda e Aluguel' },
]

const statusOptions = [
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'VENDIDO', label: 'Vendido' },
  { value: 'ALUGADO', label: 'Alugado' },
  { value: 'INATIVO', label: 'Inativo' },
]

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO'
]

const amenitiesList = [
  'Piscina',
  'Churrasqueira',
  'Jardim',
  'Playground',
  'Academia',
  'Salão de Festas',
  'Portaria 24h',
  'Elevador',
  'Ar Condicionado',
  'Aquecedor Solar',
  'Varanda/Sacada',
  'Closet',
  'Despensa',
  'Área de Serviço',
  'Quintal',
  'Garagem Coberta',
  'Piso Porcelanato',
  'Armários Embutidos',
  'Cozinha Americana',
  'Interfone',
  'Cerca Elétrica',
  'Câmeras de Segurança'
]

const neighborhoods = [
  'Alto dos Passos',
  'Bom Pastor',
  'Cascatinha',
  'Centro',
  'Costa Carvalho',
  'Dom Bosco',
  'Granbery',
  'Grajaú',
  'Jardim Glória',
  'Manoel Honório',
  'Paineiras',
  'Santa Helena',
  'Santa Luzia',
  'São Mateus',
  'São Pedro',
  'Teixeiras',
  'Vale do Ipê',
]

type TabKey = 'info' | 'valores' | 'caracteristicas' | 'endereco' | 'midia' | 'destaques'

export default function PropertyFormContent({ user }: PropertyFormContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('info')
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [images, setImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'info', label: 'Informações', icon: Info },
    { key: 'valores', label: 'Valores', icon: DollarSign },
    { key: 'caracteristicas', label: 'Características', icon: Building2 },
    { key: 'endereco', label: 'Endereço', icon: MapPin },
    { key: 'midia', label: 'Mídia', icon: ImageIcon },
    { key: 'destaques', label: 'Destaques', icon: Sparkles },
  ]

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleCEPBlur = async () => {
    const cep = formData.zipCode.replace(/\D/g, '')
    if (cep.length !== 8) return

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Preço é obrigatório'
    if (!formData.area || parseFloat(formData.area) <= 0) newErrors.area = 'Área é obrigatória'
    if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório'
    if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório'
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Ir para a aba com erro
      if (errors.title || errors.type || errors.transactionType) setActiveTab('info')
      else if (errors.price) setActiveTab('valores')
      else if (errors.area) setActiveTab('caracteristicas')
      else if (errors.address || errors.neighborhood || errors.city) setActiveTab('endereco')
      return
    }

    try {
      setSaving(true)

      const payload = {
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        transactionType: formData.transactionType,
        status: formData.status,
        price: parseFloat(formData.price),
        condominiumFee: formData.condominiumFee ? parseFloat(formData.condominiumFee) : null,
        iptu: formData.iptu ? parseFloat(formData.iptu) : null,
        area: parseFloat(formData.area),
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        suites: parseInt(formData.suites) || 0,
        parking: parseInt(formData.parking) || 0,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
        address: formData.address,
        addressNumber: formData.addressNumber || null,
        complement: formData.complement || null,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode || null,
        amenities: formData.amenities,
        featured: formData.featured,
        exclusive: formData.exclusive,
        images: images,
        videos: [],
      }

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao salvar imóvel')
      }

      router.push('/imoveis')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert(error instanceof Error ? error.message : 'Erro ao salvar imóvel')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return ''
    const amount = parseInt(numbers) / 100
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  const handleCurrencyChange = (field: keyof FormData, value: string) => {
    const numbers = value.replace(/\D/g, '')
    handleInputChange(field, numbers ? (parseInt(numbers) / 100).toString() : '')
  }

  return (
    <CRMLayout 
      title="Novo Imóvel" 
      subtitle="Preencha as informações do imóvel"
      user={user}
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/imoveis"
          className="flex items-center gap-2 text-crm-text-muted hover:text-crm-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para lista
        </Link>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-crm-accent text-white rounded-lg text-sm font-medium hover:bg-crm-accent/90 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Salvando...' : 'Salvar Imóvel'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-crm-bg-secondary p-1 rounded-lg border border-crm-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab.key
                ? "bg-crm-accent text-white"
                : "text-crm-text-muted hover:text-crm-text-primary hover:bg-crm-bg-hover"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-crm-bg-secondary border border-crm-border rounded-lg p-6">
        {/* Tab: Informações */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-crm-text-primary mb-2">
                Título do Imóvel *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: Casa 3 quartos com piscina no Cascatinha"
                className={cn(
                  "w-full px-4 py-3 bg-crm-bg-primary border rounded-lg text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent",
                  errors.title ? "border-red-500" : "border-crm-border"
                )}
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-crm-text-primary mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva o imóvel em detalhes..."
                rows={5}
                className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:border-crm-accent"
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Tipo de Negócio *
                </label>
                <select
                  value={formData.transactionType}
                  onChange={(e) => handleInputChange('transactionType', e.target.value)}
                  className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:border-crm-accent"
                >
                  {transactionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:border-crm-accent"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Valores */}
        {activeTab === 'valores' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Preço *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-crm-text-muted">R$</span>
                  <input
                    type="text"
                    value={formData.price ? formatCurrency((parseFloat(formData.price) * 100).toString()) : ''}
                    onChange={(e) => handleCurrencyChange('price', e.target.value)}
                    placeholder="0,00"
                    className={cn(
                      "w-full pl-12 pr-4 py-3 bg-crm-bg-primary border rounded-lg text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent",
                      errors.price ? "border-red-500" : "border-crm-border"
                    )}
                  />
                </div>
                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Condomínio
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-crm-text-muted">R$</span>
                  <input
                    type="text"
                    value={formData.condominiumFee ? formatCurrency((parseFloat(formData.condominiumFee) * 100).toString()) : ''}
                    onChange={(e) => handleCurrencyChange('condominiumFee', e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  IPTU (Anual)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-crm-text-muted">R$</span>
                  <input
                    type="text"
                    value={formData.iptu ? formatCurrency((parseFloat(formData.iptu) * 100).toString()) : ''}
                    onChange={(e) => handleCurrencyChange('iptu', e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Características */}
        {activeTab === 'caracteristicas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Área (m²) *
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="0"
                  className={cn(
                    "w-full px-4 py-3 bg-crm-bg-primary border rounded-lg text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent",
                    errors.area ? "border-red-500" : "border-crm-border"
                  )}
                />
                {errors.area && <p className="text-red-400 text-xs mt-1">{errors.area}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Quartos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:border-crm-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Banheiros
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:border-crm-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Suítes
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.suites}
                  onChange={(e) => handleInputChange('suites', e.target.value)}
                  className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:border-crm-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Vagas
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.parking}
                  onChange={(e) => handleInputChange('parking', e.target.value)}
                  className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:border-crm-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Ano Construção
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.yearBuilt}
                  onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                  placeholder="2020"
                  className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent"
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-crm-text-primary mb-3">
                Comodidades
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {amenitiesList.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                      formData.amenities.includes(amenity)
                        ? "bg-crm-accent text-white"
                        : "bg-crm-bg-primary border border-crm-border text-crm-text-muted hover:border-crm-accent hover:text-crm-text-primary"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                      formData.amenities.includes(amenity)
                        ? "bg-crm-bg-surface border-white"
                        : "border-crm-border"
                    )}>
                      {formData.amenities.includes(amenity) && (
                        <Check className="w-3 h-3 text-crm-accent" />
                      )}
                    </div>
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Endereço */}
        {activeTab === 'endereco' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 8))}
                  onBlur={handleCEPBlur}
                  placeholder="00000-000"
                  maxLength={9}
                  className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Endereço *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Rua, Avenida..."
                  className={cn(
                    "w-full px-4 py-3 bg-crm-bg-primary border rounded-lg text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent",
                    errors.address ? "border-red-500" : "border-crm-border"
                  )}
                />
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.addressNumber}
                  onChange={(e) => handleInputChange('addressNumber', e.target.value)}
                  placeholder="123"
                  className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  value={formData.complement}
                  onChange={(e) => handleInputChange('complement', e.target.value)}
                  placeholder="Apt, Bloco..."
                  className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Bairro *
                </label>
                <select
                  value={formData.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 bg-crm-bg-primary border rounded-lg text-crm-text-primary focus:outline-none focus:border-crm-accent",
                    errors.neighborhood ? "border-red-500" : "border-crm-border"
                  )}
                >
                  <option value="">Selecione...</option>
                  {neighborhoods.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                {errors.neighborhood && <p className="text-red-400 text-xs mt-1">{errors.neighborhood}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 bg-crm-bg-primary border rounded-lg text-crm-text-primary focus:outline-none focus:border-crm-accent",
                    errors.city ? "border-red-500" : "border-crm-border"
                  )}
                />
                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-crm-text-primary mb-2">
                  Estado
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:border-crm-accent"
                >
                  {brazilianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Mídia */}
        {activeTab === 'midia' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-crm-text-primary mb-2">
                Fotos do Imóvel
              </label>
              <p className="text-xs text-crm-text-muted mb-4">
                Arraste e solte as imagens ou clique para selecionar. Recomendamos pelo menos 5 fotos.
              </p>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-crm-border rounded-lg p-8 text-center hover:border-crm-accent transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-crm-text-muted mx-auto mb-4" />
                <p className="text-sm text-crm-text-primary mb-1">
                  Arraste imagens aqui ou clique para selecionar
                </p>
                <p className="text-xs text-crm-text-muted">
                  PNG, JPG ou WEBP (máx. 5MB cada)
                </p>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square bg-crm-bg-elevated rounded-lg overflow-hidden group">
                      <img src={image} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-crm-accent text-white text-xs rounded">
                          Capa
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-crm-text-primary mb-2">
                Vídeo (URL do YouTube)
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-crm-text-primary mb-2">
                Tour Virtual 360° (URL)
              </label>
              <input
                type="url"
                placeholder="https://..."
                className="w-full px-4 py-3 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent"
              />
            </div>
          </div>
        )}

        {/* Tab: Destaques */}
        {activeTab === 'destaques' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Featured Toggle */}
              <div 
                onClick={() => handleInputChange('featured', !formData.featured)}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                  formData.featured 
                    ? "border-yellow-500 bg-yellow-500/10" 
                    : "border-crm-border hover:border-crm-border-hover"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    formData.featured ? "bg-yellow-500" : "bg-crm-bg-hover"
                  )}>
                    <Sparkles className={cn("w-5 h-5", formData.featured ? "text-black" : "text-crm-text-muted")} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-crm-text-primary mb-1">Imóvel em Destaque</h3>
                    <p className="text-xs text-crm-text-muted">
                      O imóvel aparecerá na página inicial do site com maior visibilidade.
                    </p>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    formData.featured ? "bg-yellow-500" : "bg-crm-bg-hover"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-crm-bg-surface transition-all",
                      formData.featured ? "left-7" : "left-1"
                    )} />
                  </div>
                </div>
              </div>

              {/* Exclusive Toggle */}
              <div 
                onClick={() => handleInputChange('exclusive', !formData.exclusive)}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                  formData.exclusive 
                    ? "border-purple-500 bg-purple-500/10" 
                    : "border-crm-border hover:border-crm-border-hover"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    formData.exclusive ? "bg-purple-500" : "bg-crm-bg-hover"
                  )}>
                    <Building2 className={cn("w-5 h-5", formData.exclusive ? "text-white" : "text-crm-text-muted")} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-crm-text-primary mb-1">Imóvel Exclusivo</h3>
                    <p className="text-xs text-crm-text-muted">
                      Indica que o imóvel é de exclusividade da imobiliária.
                    </p>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    formData.exclusive ? "bg-purple-500" : "bg-crm-bg-hover"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-crm-bg-surface transition-all",
                      formData.exclusive ? "left-7" : "left-1"
                    )} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-crm-border">
        <Link
          href="/imoveis"
          className="px-4 py-2 text-crm-text-muted hover:text-crm-text-primary transition-colors"
        >
          Cancelar
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-crm-accent text-white rounded-lg text-sm font-medium hover:bg-crm-accent/90 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Salvando...' : 'Salvar Imóvel'}
          </button>
        </div>
      </div>
    </CRMLayout>
  )
}
