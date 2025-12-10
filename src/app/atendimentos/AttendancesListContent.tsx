'use client'

import { useEffect, useState, useCallback } from 'react'
import KanbanBoard from './KanbanBoard'
import Link from 'next/link'
import { CRMLayout } from '@/components/layout'
import {
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  User,
  Building2,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  MoreVertical,
  Eye,
  Trash2,
  Star,
  ArrowRight,
  LayoutGrid,
  List
} from 'lucide-react'

interface AttendancesListContentProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  source: string
  status: string
  message: string | null
  budget: number | null
  score: number
  createdAt: string
  contactedAt: string | null
  property?: {
    id: string
    title: string
    code: string
  } | null
  user?: {
    id: string
    name: string
  } | null
  _count?: {
    visits: number
    activities: number
  }
}

interface Filters {
  search: string
  source: string
  status: string
}

const sourceOptions = [
  { value: '', label: 'Todas as origens' },
  { value: 'SITE', label: 'Site' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'INDICACAO', label: 'Indicação' },
  { value: 'PORTAL_ZAP', label: 'Portal Zap' },
  { value: 'PORTAL_VIVAREAL', label: 'Viva Real' },
  { value: 'PORTAL_OLX', label: 'OLX' },
  { value: 'REDES_SOCIAIS', label: 'Redes Sociais' },
  { value: 'TELEFONE', label: 'Telefone' },
  { value: 'VISITA_ESCRITORIO', label: 'Visita Escritório' },
  { value: 'OUTRO', label: 'Outro' },
]

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'NOVO', label: 'Novo' },
  { value: 'CONTATO_REALIZADO', label: 'Contato Realizado' },
  { value: 'QUALIFICADO', label: 'Qualificado' },
  { value: 'VISITA_AGENDADA', label: 'Visita Agendada' },
  { value: 'PROPOSTA_ENVIADA', label: 'Proposta Enviada' },
  { value: 'NEGOCIACAO', label: 'Em Negociação' },
  { value: 'FECHADO_GANHO', label: 'Fechado (Ganho)' },
  { value: 'FECHADO_PERDIDO', label: 'Fechado (Perdido)' },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NOVO': return 'bg-blue-100 text-blue-800'
    case 'CONTATO_REALIZADO': return 'bg-cyan-100 text-cyan-800'
    case 'QUALIFICADO': return 'bg-purple-100 text-purple-800'
    case 'VISITA_AGENDADA': return 'bg-amber-100 text-amber-800'
    case 'PROPOSTA_ENVIADA': return 'bg-orange-100 text-orange-800'
    case 'NEGOCIACAO': return 'bg-indigo-100 text-indigo-800'
    case 'FECHADO_GANHO': return 'bg-green-100 text-green-800'
    case 'FECHADO_PERDIDO': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  const option = statusOptions.find(o => o.value === status)
  return option?.label || status
}

const getSourceLabel = (source: string) => {
  const option = sourceOptions.find(o => o.value === source)
  return option?.label || source
}

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'SITE': return <Building2 size={14} />
    case 'WHATSAPP': return <MessageSquare size={14} />
    case 'TELEFONE': return <Phone size={14} />
    default: return <User size={14} />
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

const getTimeAgo = (date: string) => {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 60) return `${diffMins}min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`
  return formatDate(date)
}

export default function AttendancesListContent({ user }: AttendancesListContentProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [filters, setFilters] = useState<Filters>({
    search: '',
    source: '',
    status: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (filters.search) params.append('search', filters.search)
      if (filters.source) params.append('source', filters.source)
      if (filters.status) params.append('status', filters.status)
      
      const response = await fetch(`/api/leads?${params}`)
      const data = await response.json()
      
      setLeads(data.leads || [])
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
      }))
    } catch (error) {
      console.error('Erro ao buscar atendimentos:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({ search: '', source: '', status: '' })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const hasActiveFilters = filters.source || filters.status

  // Atualizar status do lead (para Kanban)
  const handleUpdateStatus = useCallback(async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        ))
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }, [])

  // Agrupar leads por status para visualização em Kanban (simplificado)
  const newLeads = leads.filter(l => l.status === 'NOVO')
  const inProgressLeads = leads.filter(l => ['CONTATO_REALIZADO', 'QUALIFICADO', 'VISITA_AGENDADA'].includes(l.status))
  const negotiationLeads = leads.filter(l => ['PROPOSTA_ENVIADA', 'NEGOCIACAO'].includes(l.status))
  const closedLeads = leads.filter(l => ['FECHADO_GANHO', 'FECHADO_PERDIDO'].includes(l.status))

  return (
    <CRMLayout title="Atendimentos" subtitle="Gerencie seus leads e oportunidades" user={user}>
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DDA76A] focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'border-[#DDA76A] text-[#DDA76A] bg-[#DDA76A]/10'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={20} />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-[#DDA76A] text-white text-xs rounded-full flex items-center justify-center">
                {(filters.source ? 1 : 0) + (filters.status ? 1 : 0)}
              </span>
            )}
          </button>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#DDA76A] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List size={18} />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-[#DDA76A] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid size={18} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>
        </div>

        <Link
          href="/atendimentos/novo"
          className="flex items-center gap-2 px-4 py-2 bg-[#DDA76A] text-white rounded-lg hover:bg-[#C4934F] transition-colors"
        >
          <Plus size={20} />
          <span>Novo Atendimento</span>
        </Link>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">Filtros</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-[#DDA76A] hover:underline">
                Limpar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DDA76A] focus:border-transparent"
              >
                {sourceOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DDA76A] focus:border-transparent"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{newLeads.length}</p>
              <p className="text-sm text-gray-500">Novos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{inProgressLeads.length}</p>
              <p className="text-sm text-gray-500">Em Andamento</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <MessageSquare className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{negotiationLeads.length}</p>
              <p className="text-sm text-gray-500">Negociação</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Star className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {closedLeads.filter(l => l.status === 'FECHADO_GANHO').length}
              </p>
              <p className="text-sm text-gray-500">Fechados</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'kanban' ? (
        <KanbanBoard leads={leads} onUpdateStatus={handleUpdateStatus} />
      ) : (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#DDA76A]" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum atendimento encontrado</h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters ? 'Tente ajustar os filtros de busca' : 'Comece adicionando um novo atendimento'}
            </p>
            <Link
              href="/atendimentos/novo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#DDA76A] text-white rounded-lg hover:bg-[#C4934F] transition-colors"
            >
              <Plus size={20} />
              Novo Atendimento
            </Link>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
              <div className="col-span-3">Cliente</div>
              <div className="col-span-2">Origem</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Imóvel</div>
              <div className="col-span-2">Criado em</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <div key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <Link href={`/atendimentos/${lead.id}`} className="block">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 items-center">
                      {/* Cliente */}
                      <div className="lg:col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#DDA76A]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#DDA76A] font-semibold">
                              {lead.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate">{lead.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone size={12} />
                              <span className="truncate">{lead.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Origem */}
                      <div className="lg:col-span-2 flex items-center gap-2 text-sm text-gray-600">
                        {getSourceIcon(lead.source)}
                        <span>{getSourceLabel(lead.source)}</span>
                      </div>

                      {/* Status */}
                      <div className="lg:col-span-2">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {getStatusLabel(lead.status)}
                        </span>
                      </div>

                      {/* Imóvel */}
                      <div className="lg:col-span-2 text-sm">
                        {lead.property ? (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building2 size={14} />
                            <span className="truncate">{lead.property.code}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>

                      {/* Data */}
                      <div className="lg:col-span-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{getTimeAgo(lead.createdAt)}</span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="lg:col-span-1 flex justify-end" onClick={(e) => e.preventDefault()}>
                        <Link 
                          href={`/atendimentos/${lead.id}`}
                          className="p-2 text-gray-400 hover:text-[#DDA76A] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ArrowRight size={20} />
                        </Link>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="px-3 py-2 text-sm font-medium">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      )}
    </CRMLayout>
  )
}
