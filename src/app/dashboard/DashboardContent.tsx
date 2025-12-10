'use client'

import { useEffect, useState } from 'react'
import { CRMLayout } from '@/components/layout'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Calendar,
  Home,
  DollarSign,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface DashboardContentProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

interface DashboardData {
  properties: {
    total: number
    available: number
    sold: number
    rented: number
    featured: number
  }
  leads: {
    total: number
    new: number
    qualified: number
    closedWon: number
    closedLost: number
  }
  tasks: {
    pending: number
    overdue: number
    completedThisMonth: number
  }
  visits: {
    thisMonth: number
  }
  financial: {
    inNegotiation: number
  }
  recent: {
    leads: Array<{
      id: string
      name: string
      status: string
      createdAt: string
      property?: { title: string; code: string }
    }>
    properties: Array<{
      id: string
      code: string
      title: string
      price: number
      status: string
      transactionType: string
      images: string[]
    }>
    tasks: Array<{
      id: string
      title: string
      type: string
      dueDate: string
      priority: string
    }>
  }
}

const statusColors: Record<string, string> = {
  NOVO: 'bg-blue-500/20 text-blue-400',
  CONTATO_REALIZADO: 'bg-cyan-500/20 text-cyan-400',
  QUALIFICADO: 'bg-purple-500/20 text-purple-400',
  VISITA_AGENDADA: 'bg-amber-500/20 text-amber-400',
  PROPOSTA_ENVIADA: 'bg-orange-500/20 text-orange-400',
  NEGOCIACAO: 'bg-indigo-500/20 text-indigo-400',
  FECHADO_GANHO: 'bg-green-500/20 text-green-400',
  FECHADO_PERDIDO: 'bg-red-500/20 text-red-400',
}

const priorityColors: Record<string, string> = {
  URGENTE: 'bg-red-500',
  ALTA: 'bg-red-400',
  MEDIA: 'bg-yellow-400',
  BAIXA: 'bg-gray-400',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value)
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}min`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('pt-BR')
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) throw new Error('Erro ao carregar dados')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <CRMLayout title="Dashboard" subtitle="Carregando..." user={user}>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-[#DDA76A] animate-spin" />
            <p className="text-crm-text-muted">Carregando dashboard...</p>
          </div>
        </div>
      </CRMLayout>
    )
  }

  if (error) {
    return (
      <CRMLayout title="Dashboard" subtitle="Erro" user={user}>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-crm-text-primary font-medium">Erro ao carregar dashboard</p>
            <p className="text-crm-text-muted">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#DDA76A] text-white rounded-lg hover:bg-[#C4934F] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </CRMLayout>
    )
  }

  const stats = [
    {
      title: 'Imóveis Disponíveis',
      value: data?.properties.available || 0,
      subtitle: `${data?.properties.total || 0} total`,
      icon: Building2,
      color: 'bg-blue-500'
    },
    {
      title: 'Leads Novos',
      value: data?.leads.new || 0,
      subtitle: `${data?.leads.total || 0} total`,
      icon: UserPlus,
      color: 'bg-green-500'
    },
    {
      title: 'Tarefas Pendentes',
      value: data?.tasks.pending || 0,
      subtitle: data?.tasks.overdue ? `${data.tasks.overdue} atrasadas` : 'Nenhuma atrasada',
      icon: CheckCircle,
      color: data?.tasks.overdue ? 'bg-red-500' : 'bg-yellow-500',
      alert: (data?.tasks.overdue || 0) > 0
    },
    {
      title: 'Em Negociação',
      value: formatCurrency(data?.financial.inNegotiation || 0),
      subtitle: `${data?.visits.thisMonth || 0} visitas este mês`,
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ]

  return (
    <CRMLayout title="Dashboard" subtitle={`Olá, ${user.name?.split(' ')[0]}! 👋`} user={user}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-crm-bg-surface border border-crm-border rounded-xl p-5 ${stat.alert ? 'border-red-500/50' : ''}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-crm-text-muted">{stat.title}</p>
                <p className="text-2xl font-bold text-crm-text-primary mt-1">
                  {typeof stat.value === 'number' ? stat.value : stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-2.5 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <span className={`text-sm ${stat.alert ? 'text-red-400' : 'text-crm-text-muted'}`}>
                {stat.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Leads */}
        <div className="bg-crm-bg-surface border border-crm-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-crm-text-primary flex items-center gap-2">
              <Users className="w-5 h-5 text-[#DDA76A]" />
              Leads Recentes
            </h2>
            <Link href="/leads" className="text-sm text-[#DDA76A] hover:underline">
              Ver todos
            </Link>
          </div>
          
          <div className="space-y-3">
            {data?.recent.leads.length === 0 ? (
              <p className="text-crm-text-muted text-center py-8">Nenhum lead recente</p>
            ) : (
              data?.recent.leads.map((lead) => (
                <Link key={lead.id} href={`/atendimentos/${lead.id}`} className="flex items-center justify-between p-3 bg-crm-bg-elevated hover:bg-crm-bg-hover rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-crm-text-primary">{lead.name}</p>
                    <p className="text-sm text-crm-text-muted">
                      {lead.property ? `${lead.property.code} - ${lead.property.title}` : 'Sem imóvel vinculado'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {lead.status.replace(/_/g, ' ')}
                    </span>
                    <p className="text-xs text-crm-text-muted mt-1">{formatRelativeTime(lead.createdAt)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-crm-bg-surface border border-crm-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-crm-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#DDA76A]" />
              Próximas Tarefas
            </h2>
            <Link href="/tarefas" className="text-sm text-[#DDA76A] hover:underline">
              Ver todas
            </Link>
          </div>
          
          <div className="space-y-3">
            {data?.recent.tasks.length === 0 ? (
              <p className="text-crm-text-muted text-center py-8">Nenhuma tarefa pendente</p>
            ) : (
              data?.recent.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-crm-bg-elevated rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-10 rounded-full ${priorityColors[task.priority] || 'bg-gray-400'}`} />
                    <div>
                      <p className="font-medium text-crm-text-primary">{task.title}</p>
                      <p className="text-sm text-crm-text-muted">{task.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-crm-text-secondary">
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-crm-text-muted">{task.priority}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="bg-crm-bg-surface border border-crm-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-crm-text-primary flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#DDA76A]" />
            Imóveis Recentes
          </h2>
          <Link href="/imoveis" className="text-sm text-[#DDA76A] hover:underline">
            Ver todos
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {data?.recent.properties.length === 0 ? (
            <p className="text-crm-text-muted col-span-full text-center py-8">Nenhum imóvel cadastrado</p>
          ) : (
            data?.recent.properties.map((property) => (
              <Link key={property.id} href={`/imoveis/${property.id}`} className="bg-crm-bg-elevated rounded-lg overflow-hidden hover:ring-1 hover:ring-[#DDA76A]/50 transition-all">
                <div className="aspect-video bg-crm-bg-hover flex items-center justify-center">
                  {property.images?.[0] ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-crm-text-muted" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-[#DDA76A] font-medium">{property.code}</p>
                  <p className="text-sm font-medium text-crm-text-primary truncate">{property.title}</p>
                  <p className="text-sm text-[#DDA76A] font-bold mt-1">{formatCurrency(property.price)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      property.transactionType === 'VENDA' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {property.transactionType}
                    </span>
                    <span className={`text-xs ${
                      property.status === 'DISPONIVEL' ? 'text-green-400' : 'text-crm-text-muted'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-crm-bg-surface border border-crm-border rounded-xl p-5">
        <h2 className="text-lg font-semibold text-crm-text-primary mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/imoveis/novo" className="flex flex-col items-center gap-2 p-4 bg-crm-bg-elevated hover:bg-crm-bg-hover rounded-lg border border-crm-border transition-colors">
            <Building2 className="w-6 h-6 text-[#DDA76A]" />
            <span className="text-sm text-crm-text-primary">Novo Imóvel</span>
          </Link>
          <Link href="/atendimentos/novo" className="flex flex-col items-center gap-2 p-4 bg-crm-bg-elevated hover:bg-crm-bg-hover rounded-lg border border-crm-border transition-colors">
            <UserPlus className="w-6 h-6 text-[#DDA76A]" />
            <span className="text-sm text-crm-text-primary">Novo Lead</span>
          </Link>
          <Link href="/tarefas" className="flex flex-col items-center gap-2 p-4 bg-crm-bg-elevated hover:bg-crm-bg-hover rounded-lg border border-crm-border transition-colors">
            <Calendar className="w-6 h-6 text-[#DDA76A]" />
            <span className="text-sm text-crm-text-primary">Nova Tarefa</span>
          </Link>
          <Link href="/relatorios" className="flex flex-col items-center gap-2 p-4 bg-crm-bg-elevated hover:bg-crm-bg-hover rounded-lg border border-crm-border transition-colors">
            <TrendingUp className="w-6 h-6 text-[#DDA76A]" />
            <span className="text-sm text-crm-text-primary">Relatórios</span>
          </Link>
        </div>
      </div>
    </CRMLayout>
  )
}
