'use client'

import { useEffect, useState, useCallback } from 'react'
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
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  ArrowRight,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react'

interface LeadsContentProps {
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
  cpf: string | null
  source: string
  status: string
  message: string | null
  budget: number | null
  interestType: string | null
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
  scoreMin: string
  dateFrom: string
  dateTo: string
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
    case 'NOVO': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'CONTATO_REALIZADO': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
    case 'QUALIFICADO': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'VISITA_AGENDADA': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'PROPOSTA_ENVIADA': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'NEGOCIACAO': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    case 'FECHADO_GANHO': return 'bg-green-100 text-green-800 border-green-200'
    case 'FECHADO_PERDIDO': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 bg-green-100'
  if (score >= 60) return 'text-amber-600 bg-amber-100'
  if (score >= 40) return 'text-orange-600 bg-orange-100'
  return 'text-red-600 bg-red-100'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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
  
  if (diffMins < 60) return `${diffMins}min`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return formatDate(date)
}

export default function LeadsContent({ user }: LeadsContentProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    source: '',
    status: '',
    scoreMin: '',
    dateFrom: '',
    dateTo: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [stats, setStats] = useState({
    total: 0,
    novos: 0,
    qualificados: 0,
    convertidos: 0,
    taxaConversao: 0,
  })
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [showActions, setShowActions] = useState<string | null>(null)

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
      
      // Calcular stats
      const allLeads = data.leads || []
      const novos = allLeads.filter((l: Lead) => l.status === 'NOVO').length
      const qualificados = allLeads.filter((l: Lead) => 
        ['QUALIFICADO', 'VISITA_AGENDADA', 'PROPOSTA_ENVIADA', 'NEGOCIACAO'].includes(l.status)
      ).length
      const convertidos = allLeads.filter((l: Lead) => l.status === 'FECHADO_GANHO').length
      const total = data.total || 0
      
      setStats({
        total,
        novos,
        qualificados,
        convertidos,
        taxaConversao: total > 0 ? Math.round((convertidos / total) * 100) : 0,
      })
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
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
    setFilters({ search: '', source: '', status: '', scoreMin: '', dateFrom: '', dateTo: '' })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const hasActiveFilters = filters.source || filters.status || filters.scoreMin || filters.dateFrom || filters.dateTo

  const toggleSelectLead = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map(l => l.id))
    }
  }

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return
    
    try {
      const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchLeads()
      }
    } catch (error) {
      console.error('Erro ao excluir lead:', error)
    }
  }

  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Origem', 'Status', 'Score', 'Orçamento', 'Data']
    const rows = leads.map(l => [
      l.name,
      l.email,
      l.phone,
      getSourceLabel(l.source),
      getStatusLabel(l.status),
      l.score.toString(),
      l.budget ? formatCurrency(l.budget) : '-',
      formatDate(l.createdAt)
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <CRMLayout title="Leads" subtitle="Gestão de leads e funil de vendas" user={user}>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Leads</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
              <User className="text-cyan-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.novos}</p>
              <p className="text-sm text-gray-500">Novos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Target className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.qualificados}</p>
              <p className="text-sm text-gray-500">Qualificados</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Star className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.convertidos}</p>
              <p className="text-sm text-gray-500">Convertidos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.taxaConversao}%</p>
              <p className="text-sm text-gray-500">Taxa Conversão</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DDA76A] focus:border-transparent"
            />
          </div>

          {/* Quick Filters */}
          <select
            value={filters.source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DDA76A] focus:border-transparent"
          >
            {sourceOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DDA76A] focus:border-transparent"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <X size={16} />
              Limpar
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Export */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={20} />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {/* New Lead */}
          <Link
            href="/atendimentos/novo"
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA76A] text-white rounded-lg hover:bg-[#C4934F] transition-colors"
          >
            <Plus size={20} />
            <span>Novo Lead</span>
          </Link>
        </div>
      </div>

      {/* Selected Actions */}
      {selectedLeads.length > 0 && (
        <div className="mb-4 p-3 bg-[#DDA76A]/10 border border-[#DDA76A]/30 rounded-lg flex items-center justify-between">
          <span className="text-sm text-gray-700">
            {selectedLeads.length} lead(s) selecionado(s)
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Alterar Status
            </button>
            <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Atribuir Corretor
            </button>
            <button 
              onClick={() => setSelectedLeads([])}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#DDA76A]" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum lead encontrado</h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters ? 'Tente ajustar os filtros' : 'Comece adicionando um novo lead'}
            </p>
            <Link
              href="/atendimentos/novo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#DDA76A] text-white rounded-lg hover:bg-[#C4934F] transition-colors"
            >
              <Plus size={20} />
              Novo Lead
            </Link>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#DDA76A] focus:ring-[#DDA76A]"
                />
              </div>
              <div className="col-span-3">Lead</div>
              <div className="col-span-2">Origem</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-center">Score</div>
              <div className="col-span-2">Criado em</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <div 
                  key={lead.id} 
                  className={`hover:bg-gray-50 transition-colors ${selectedLeads.includes(lead.id) ? 'bg-[#DDA76A]/5' : ''}`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 items-center">
                    {/* Checkbox */}
                    <div className="hidden lg:flex lg:col-span-1 items-center">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleSelectLead(lead.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#DDA76A] focus:ring-[#DDA76A]"
                      />
                    </div>

                    {/* Lead Info */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#DDA76A]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#DDA76A] font-semibold">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <Link 
                            href={`/atendimentos/${lead.id}`}
                            className="font-medium text-gray-800 hover:text-[#DDA76A] truncate block"
                          >
                            {lead.name}
                          </Link>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {lead.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Origem */}
                    <div className="lg:col-span-2 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {getSourceLabel(lead.source)}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-2">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="lg:col-span-1 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </span>
                    </div>

                    {/* Data */}
                    <div className="lg:col-span-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(lead.createdAt)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {getTimeAgo(lead.createdAt)} atrás
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="lg:col-span-1 flex justify-end relative">
                      <button
                        onClick={() => setShowActions(showActions === lead.id ? null : lead.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      {showActions === lead.id && (
                        <div className="absolute right-0 top-10 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                          <Link
                            href={`/atendimentos/${lead.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye size={16} />
                            Ver Detalhes
                          </Link>
                          <Link
                            href={`/atendimentos/${lead.id}/editar`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit size={16} />
                            Editar
                          </Link>
                          <a
                            href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <MessageSquare size={16} />
                            WhatsApp
                          </a>
                          <hr className="my-1" />
                          <button
                            onClick={() => {
                              setShowActions(null)
                              handleDeleteLead(lead.id)
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                          >
                            <Trash2 size={16} />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} leads
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
    </CRMLayout>
  )
}
