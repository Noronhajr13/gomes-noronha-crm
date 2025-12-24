'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import CRMLayout from '@/components/layout/CRMLayout'
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Building2,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Star,
  Check,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertiesListContentProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

interface Property {
  id: string
  code: string
  title: string
  type: string
  purpose: string
  status: string
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  parkingSpots: number
  neighborhood: string
  city: string
  images: string[]
  featured: boolean
  exclusive: boolean
  createdAt: string
  user?: {
    id: string
    name: string
  }
  _count?: {
    leads: number
    visits: number
  }
}

interface Filters {
  search: string
  type: string
  transactionType: string
  status: string
  minPrice: string
  maxPrice: string
}

const propertyTypes = [
  { value: '', label: 'Todos os tipos' },
  { value: 'CASA', label: 'Casa' },
  { value: 'APARTAMENTO', label: 'Apartamento' },
  { value: 'COBERTURA', label: 'Cobertura' },
  { value: 'KITNET', label: 'Kitnet' },
  { value: 'FLAT', label: 'Flat' },
  { value: 'SOBRADO', label: 'Sobrado' },
  { value: 'TERRENO', label: 'Terreno' },
  { value: 'COMERCIAL', label: 'Comercial' },
  { value: 'SALA_COMERCIAL', label: 'Sala Comercial' },
  { value: 'LOJA', label: 'Loja' },
  { value: 'GALPAO', label: 'Galpão' },
  { value: 'RURAL', label: 'Rural' },
  { value: 'SITIO', label: 'Sítio' },
  { value: 'FAZENDA', label: 'Fazenda' },
]

const transactionTypes = [
  { value: '', label: 'Todos' },
  { value: 'VENDA', label: 'Venda' },
  { value: 'ALUGUEL', label: 'Aluguel' },
  { value: 'VENDA_ALUGUEL', label: 'Venda/Aluguel' },
]

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'VENDIDO', label: 'Vendido' },
  { value: 'ALUGADO', label: 'Alugado' },
  { value: 'INATIVO', label: 'Inativo' },
]

const statusColors: Record<string, string> = {
  DISPONIVEL: 'bg-green-500/20 text-green-400',
  RESERVADO: 'bg-yellow-500/20 text-yellow-400',
  VENDIDO: 'bg-blue-500/20 text-blue-400',
  ALUGADO: 'bg-purple-500/20 text-purple-400',
  INATIVO: 'bg-crm-bg-elevated0/20 text-crm-text-muted',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value)
}

export default function PropertiesListContent({ user }: PropertiesListContentProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: '',
    transactionType: '',
    status: '',
    minPrice: '',
    maxPrice: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filters.search) params.append('search', filters.search)
      if (filters.type) params.append('type', filters.type)
      if (filters.transactionType) params.append('transactionType', filters.transactionType)
      if (filters.status) params.append('status', filters.status)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)

      const res = await fetch(`/api/properties?${params}`)
      const data = await res.json()
      
      setProperties(data.properties || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }))
    } catch (error) {
      console.error('Erro ao buscar imóveis:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      transactionType: '',
      status: '',
      minPrice: '',
      maxPrice: '',
    })
  }

  const togglePropertySelection = (id: string) => {
    setSelectedProperties(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([])
    } else {
      setSelectedProperties(properties.map(p => p.id))
    }
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  return (
    <CRMLayout 
      title="Imóveis" 
      subtitle={`${pagination.total} imóveis cadastrados`}
      user={user}
    >
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-crm-text-muted" />
            <input
              type="text"
              placeholder="Buscar por código, título ou endereço..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-crm-bg-secondary border border-crm-border rounded-lg text-sm text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              showFilters || hasActiveFilters
                ? "bg-crm-accent text-white"
                : "bg-crm-bg-secondary text-crm-text-muted hover:bg-crm-bg-hover hover:text-crm-text-primary border border-crm-border"
            )}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-crm-bg-surface text-crm-accent text-xs flex items-center justify-center">
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-crm-bg-secondary rounded-lg border border-crm-border p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === 'grid' 
                  ? "bg-crm-accent text-white" 
                  : "text-crm-text-muted hover:text-crm-text-primary"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === 'list' 
                  ? "bg-crm-accent text-white" 
                  : "text-crm-text-muted hover:text-crm-text-primary"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* New Property Button */}
          <Link
            href="/imoveis/novo"
            className="flex items-center gap-2 px-4 py-2 bg-crm-accent text-white rounded-lg text-sm font-medium hover:bg-crm-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Imóvel
          </Link>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-crm-bg-secondary border border-crm-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-crm-text-primary">Filtros avançados</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-crm-accent-blue hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type */}
            <div>
              <label className="block text-xs text-crm-text-muted mb-1">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-sm text-crm-text-primary focus:outline-none focus:border-crm-accent"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-xs text-crm-text-muted mb-1">Negócio</label>
              <select
                value={filters.transactionType}
                onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                className="w-full px-3 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-sm text-crm-text-primary focus:outline-none focus:border-crm-accent"
              >
                {transactionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs text-crm-text-muted mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-sm text-crm-text-primary focus:outline-none focus:border-crm-accent"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs text-crm-text-muted mb-1">Faixa de Preço</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="flex-1 px-3 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-sm text-crm-text-primary focus:outline-none focus:border-crm-accent"
                />
                <span className="text-crm-text-muted">-</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="flex-1 px-3 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-sm text-crm-text-primary focus:outline-none focus:border-crm-accent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedProperties.length > 0 && (
        <div className="bg-crm-accent/10 border border-crm-accent/30 rounded-lg p-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-crm-accent" />
            <span className="text-sm text-crm-text-primary">
              {selectedProperties.length} imóvel(is) selecionado(s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm bg-crm-bg-secondary text-crm-text-primary rounded hover:bg-crm-bg-hover transition-colors">
              Alterar status
            </button>
            <button className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">
              Excluir
            </button>
            <button 
              onClick={() => setSelectedProperties([])}
              className="p-1.5 text-crm-text-muted hover:text-crm-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-crm-accent animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="w-16 h-16 text-crm-text-muted mb-4" />
          <h3 className="text-lg font-medium text-crm-text-primary mb-2">Nenhum imóvel encontrado</h3>
          <p className="text-crm-text-muted mb-6">
            {hasActiveFilters 
              ? 'Tente ajustar os filtros para ver mais resultados.'
              : 'Comece cadastrando seu primeiro imóvel.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-crm-bg-secondary text-crm-text-primary rounded-lg hover:bg-crm-bg-hover transition-colors"
            >
              Limpar filtros
            </button>
          ) : (
            <Link
              href="/imoveis/novo"
              className="flex items-center gap-2 px-4 py-2 bg-crm-accent text-white rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Cadastrar imóvel
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className={cn(
                "bg-crm-bg-secondary border rounded-lg overflow-hidden group transition-all",
                selectedProperties.includes(property.id)
                  ? "border-crm-accent"
                  : "border-crm-border hover:border-crm-border-hover"
              )}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-crm-bg-elevated">
                {property.images?.[0] ? (
                  <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-crm-text-muted" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  {property.featured && (
                    <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-medium rounded">
                      Destaque
                    </span>
                  )}
                  {property.exclusive && (
                    <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-medium rounded">
                      Exclusivo
                    </span>
                  )}
                </div>

                {/* Selection Checkbox */}
                <button
                  onClick={() => togglePropertySelection(property.id)}
                  className={cn(
                    "absolute top-2 right-2 w-6 h-6 rounded border flex items-center justify-center transition-colors",
                    selectedProperties.includes(property.id)
                      ? "bg-crm-accent border-crm-accent"
                      : "bg-black/50 border-white/30 opacity-0 group-hover:opacity-100"
                  )}
                >
                  {selectedProperties.includes(property.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>

                {/* Transaction Type Badge */}
                <div className="absolute bottom-2 left-2">
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded",
                    property.purpose === 'VENDA' 
                      ? "bg-blue-500/80 text-white" 
                      : property.purpose === 'ALUGUEL'
                      ? "bg-green-500/80 text-white"
                      : "bg-purple-500/80 text-white"
                  )}>
                    {property.purpose.replace('_', '/')}
                  </span>
                </div>

                {/* Photo Count */}
                {property.images?.length > 1 && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded flex items-center gap-1">
                    <Maximize className="w-3 h-3" />
                    {property.images.length}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs text-crm-accent-blue font-medium">{property.code}</span>
                    <h3 className="text-sm font-medium text-crm-text-primary line-clamp-1">
                      {property.title}
                    </h3>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 text-xs rounded whitespace-nowrap",
                    statusColors[property.status] || 'bg-crm-bg-elevated0/20 text-crm-text-muted'
                  )}>
                    {property.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-crm-text-muted mb-3">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs truncate">{property.neighborhood}, {property.city}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-crm-text-muted mb-3">
                  {property.area > 0 && (
                    <span className="flex items-center gap-1">
                      <Maximize className="w-3 h-3" />
                      {property.area}m²
                    </span>
                  )}
                  {property.bedrooms > 0 && (
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      {property.bedrooms}
                    </span>
                  )}
                  {property.bathrooms > 0 && (
                    <span className="flex items-center gap-1">
                      <Bath className="w-3 h-3" />
                      {property.bathrooms}
                    </span>
                  )}
                  {property.parkingSpots > 0 && (
                    <span className="flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      {property.parkingSpots}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-crm-accent">
                    {formatCurrency(property.price)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/imoveis/${property.id}`}
                      className="p-1.5 text-crm-text-muted hover:text-crm-text-primary hover:bg-crm-bg-hover rounded transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/imoveis/${property.id}/editar`}
                      className="p-1.5 text-crm-text-muted hover:text-crm-text-primary hover:bg-crm-bg-hover rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-crm-bg-secondary border border-crm-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-crm-border">
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProperties.length === properties.length && properties.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 rounded border-crm-border bg-crm-bg-primary"
                  />
                </th>
                <th className="p-3 text-left text-xs font-medium text-crm-text-muted uppercase">Imóvel</th>
                <th className="p-3 text-left text-xs font-medium text-crm-text-muted uppercase">Tipo</th>
                <th className="p-3 text-left text-xs font-medium text-crm-text-muted uppercase">Localização</th>
                <th className="p-3 text-left text-xs font-medium text-crm-text-muted uppercase">Preço</th>
                <th className="p-3 text-left text-xs font-medium text-crm-text-muted uppercase">Status</th>
                <th className="p-3 text-left text-xs font-medium text-crm-text-muted uppercase">Atendimentos</th>
                <th className="p-3 text-right text-xs font-medium text-crm-text-muted uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr 
                  key={property.id} 
                  className={cn(
                    "border-b border-crm-border last:border-0 hover:bg-crm-bg-hover/50 transition-colors",
                    selectedProperties.includes(property.id) && "bg-crm-accent/5"
                  )}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.id)}
                      onChange={() => togglePropertySelection(property.id)}
                      className="w-4 h-4 rounded border-crm-border bg-crm-bg-primary"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-crm-bg-elevated flex-shrink-0 overflow-hidden">
                        {property.images?.[0] ? (
                          <Image
                            src={property.images[0]}
                            alt={property.title}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-crm-text-muted" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs text-crm-accent-blue font-medium">{property.code}</span>
                        <p className="text-sm font-medium text-crm-text-primary line-clamp-1">{property.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-crm-text-secondary">{property.type}</span>
                    <span className={cn(
                      "block text-xs mt-0.5",
                      property.purpose === 'VENDA' ? "text-blue-400" : "text-green-400"
                    )}>
                      {property.purpose}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-crm-text-secondary">{property.neighborhood}</span>
                    <span className="block text-xs text-crm-text-muted">{property.city}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-medium text-crm-accent">{formatCurrency(property.price)}</span>
                  </td>
                  <td className="p-3">
                    <span className={cn(
                      "px-2 py-0.5 text-xs rounded",
                      statusColors[property.status] || 'bg-crm-bg-elevated0/20 text-crm-text-muted'
                    )}>
                      {property.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-crm-text-secondary">
                      {property._count?.leads || 0} leads
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/imoveis/${property.id}`}
                        className="p-1.5 text-crm-text-muted hover:text-crm-text-primary hover:bg-crm-bg-hover rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/imoveis/${property.id}/editar`}
                        className="p-1.5 text-crm-text-muted hover:text-crm-text-primary hover:bg-crm-bg-hover rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="p-1.5 text-crm-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-crm-text-muted">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 bg-crm-bg-secondary border border-crm-border rounded-lg text-crm-text-muted hover:text-crm-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  className={cn(
                    "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                    pagination.page === pageNum
                      ? "bg-crm-accent text-white"
                      : "bg-crm-bg-secondary border border-crm-border text-crm-text-muted hover:text-crm-text-primary"
                  )}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 bg-crm-bg-secondary border border-crm-border rounded-lg text-crm-text-muted hover:text-crm-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </CRMLayout>
  )
}
