'use client'

import { useEffect, useState } from 'react'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  Home,
  DollarSign,
  UserPlus,
  Clock,
  LogOut,
  Settings,
  Bell,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface DashboardContentProps {
  user: {
    name?: string | null
    email?: string | null
    role: string
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
  NOVO: 'crm-badge-info',
  CONTATO_REALIZADO: 'crm-badge-warning',
  QUALIFICADO: 'crm-badge-success',
  VISITA_AGENDADA: 'crm-badge-success',
  PROPOSTA_ENVIADA: 'crm-badge-warning',
  NEGOCIACAO: 'crm-badge-warning',
  FECHADO_GANHO: 'crm-badge-success',
  FECHADO_PERDIDO: 'crm-badge-danger',
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
      <div className="min-h-screen bg-crm-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-crm-accent animate-spin" />
          <p className="text-crm-text-muted">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-crm-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-crm-text-primary font-medium">Erro ao carregar dashboard</p>
          <p className="text-crm-text-muted">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="crm-button-primary"
          >
            Tentar novamente
          </button>
        </div>
      </div>
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
    <div className="min-h-screen bg-crm-bg-primary">
      {/* Header */}
      <header className="bg-crm-bg-secondary border-b border-crm-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-crm-accent rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-crm-text-primary">Gomes & Noronha CRM</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-crm-bg-hover text-crm-text-primary text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/imoveis" className="px-4 py-2 rounded-lg text-crm-text-muted hover:bg-crm-bg-hover hover:text-crm-text-primary text-sm font-medium transition-colors">
                Imóveis
              </Link>
              <Link href="/leads" className="px-4 py-2 rounded-lg text-crm-text-muted hover:bg-crm-bg-hover hover:text-crm-text-primary text-sm font-medium transition-colors">
                Leads
              </Link>
              <Link href="/tarefas" className="px-4 py-2 rounded-lg text-crm-text-muted hover:bg-crm-bg-hover hover:text-crm-text-primary text-sm font-medium transition-colors">
                Tarefas
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <button className="p-2 text-crm-text-muted hover:text-crm-text-primary hover:bg-crm-bg-hover rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                {(data?.tasks.overdue || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {data?.tasks.overdue}
                  </span>
                )}
              </button>
              <button className="p-2 text-crm-text-muted hover:text-crm-text-primary hover:bg-crm-bg-hover rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-crm-border" />
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-crm-text-primary">{user.name}</p>
                  <p className="text-xs text-crm-text-muted">{user.role}</p>
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="p-2 text-crm-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-crm-text-primary">
            Olá, {user.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-crm-text-muted mt-1">
            Aqui está o resumo do seu negócio hoje.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className={`crm-card ${stat.alert ? 'border-red-500/50' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-crm-text-muted">{stat.title}</p>
                  <p className="text-2xl font-bold text-crm-text-primary mt-1">
                    {typeof stat.value === 'number' ? stat.value : stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-2 rounded-lg`}>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className="crm-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-crm-text-primary flex items-center gap-2">
                <Users className="w-5 h-5" />
                Leads Recentes
              </h2>
              <Link href="/leads" className="text-sm text-crm-accent-blue hover:underline">
                Ver todos
              </Link>
            </div>
            
            <div className="space-y-4">
              {data?.recent.leads.length === 0 ? (
                <p className="text-crm-text-muted text-center py-8">Nenhum lead recente</p>
              ) : (
                data?.recent.leads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-crm-bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-crm-text-primary">{lead.name}</p>
                      <p className="text-sm text-crm-text-muted">
                        {lead.property ? `${lead.property.code} - ${lead.property.title}` : 'Sem imóvel vinculado'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`crm-badge ${statusColors[lead.status] || 'crm-badge-info'}`}>
                        {lead.status.replace(/_/g, ' ')}
                      </span>
                      <p className="text-xs text-crm-text-muted mt-1">{formatRelativeTime(lead.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="crm-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-crm-text-primary flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Próximas Tarefas
              </h2>
              <Link href="/tarefas" className="text-sm text-crm-accent-blue hover:underline">
                Ver todas
              </Link>
            </div>
            
            <div className="space-y-4">
              {data?.recent.tasks.length === 0 ? (
                <p className="text-crm-text-muted text-center py-8">Nenhuma tarefa pendente</p>
              ) : (
                data?.recent.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-crm-bg-secondary rounded-lg">
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
        <div className="mt-6 crm-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-crm-text-primary flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Imóveis Recentes
            </h2>
            <Link href="/imoveis" className="text-sm text-crm-accent-blue hover:underline">
              Ver todos
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {data?.recent.properties.length === 0 ? (
              <p className="text-crm-text-muted col-span-full text-center py-8">Nenhum imóvel cadastrado</p>
            ) : (
              data?.recent.properties.map((property) => (
                <div key={property.id} className="bg-crm-bg-secondary rounded-lg overflow-hidden">
                  <div className="aspect-video bg-crm-bg-elevated flex items-center justify-center">
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
                    <p className="text-xs text-crm-accent-blue font-medium">{property.code}</p>
                    <p className="text-sm font-medium text-crm-text-primary truncate">{property.title}</p>
                    <p className="text-sm text-crm-accent font-bold mt-1">{formatCurrency(property.price)}</p>
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
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 crm-card">
          <h2 className="text-lg font-semibold text-crm-text-primary mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/imoveis/novo" className="crm-button-secondary flex flex-col items-center gap-2 py-4">
              <Building2 className="w-6 h-6" />
              <span>Novo Imóvel</span>
            </Link>
            <Link href="/leads/novo" className="crm-button-secondary flex flex-col items-center gap-2 py-4">
              <UserPlus className="w-6 h-6" />
              <span>Novo Lead</span>
            </Link>
            <Link href="/tarefas/nova" className="crm-button-secondary flex flex-col items-center gap-2 py-4">
              <Calendar className="w-6 h-6" />
              <span>Nova Tarefa</span>
            </Link>
            <Link href="/relatorios" className="crm-button-secondary flex flex-col items-center gap-2 py-4">
              <TrendingUp className="w-6 h-6" />
              <span>Relatórios</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
