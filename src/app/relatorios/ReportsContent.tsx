'use client'

import { useState, useEffect } from 'react'
import { CRMLayout } from '@/components/layout'
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Building2,
  DollarSign,
  Target,
  FileText,
  Loader2,
} from 'lucide-react'

interface ReportsContentProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export default function ReportsContent({ user }: ReportsContentProps) {
  const [reportType, setReportType] = useState('general')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetchReport()
  }, [reportType, startDate, endDate])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: reportType })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const res = await fetch(`/api/reports?${params}`)
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!data) return

    let csvContent = 'data:text/csv;charset=utf-8,'
    let rows: string[][] = []

    if (reportType === 'sales' && data.sales) {
      rows = [
        ['Código', 'Título', 'Preço', 'Tipo', 'Propósito', 'Corretor', 'Data'],
        ...data.sales.map((sale: any) => [
          sale.code,
          sale.title,
          sale.price.toString(),
          sale.type,
          sale.purpose,
          sale.user.name,
          new Date(sale.createdAt).toLocaleDateString('pt-BR'),
        ]),
      ]
    } else if (reportType === 'leads' && data.leads) {
      rows = [
        ['Nome', 'Email', 'Telefone', 'Status', 'Origem', 'Orçamento', 'Corretor', 'Data'],
        ...data.leads.map((lead: any) => [
          lead.name,
          lead.email || '',
          lead.phone,
          lead.status,
          lead.source,
          lead.budget?.toString() || '',
          lead.user?.name || '',
          new Date(lead.createdAt).toLocaleDateString('pt-BR'),
        ]),
      ]
    } else if (reportType === 'performance' && data.users) {
      rows = [
        ['Nome', 'Função', 'Imóveis', 'Leads', 'Leads Fechados', 'Tarefas', 'Tarefas Concluídas'],
        ...data.users.map((user: any) => [
          user.name,
          user.role,
          user.stats.properties.toString(),
          user.stats.leads.toString(),
          user.stats.closedLeads.toString(),
          user.stats.tasks.toString(),
          user.stats.completedTasks.toString(),
        ]),
      ]
    }

    csvContent += rows.map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `relatorio_${reportType}_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <CRMLayout title="Relatórios" user={user}>
      <div className="space-y-6">
        {/* Header com Filtros */}
        <div className="bg-crm-bg-secondary rounded-lg border border-crm-border p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Tipo de Relatório */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                Tipo de Relatório
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
              >
                <option value="general">Geral</option>
                <option value="sales">Vendas</option>
                <option value="leads">Leads</option>
                <option value="performance">Performance da Equipe</option>
              </select>
            </div>

            {/* Data Início */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
              />
            </div>

            {/* Data Fim */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
              />
            </div>

            {/* Botão Exportar */}
            <div className="flex items-end">
              <button
                onClick={exportToCSV}
                disabled={!data || loading}
                className="flex items-center gap-2 px-6 py-2 bg-[#DDA76A] hover:bg-[#C89659] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo do Relatório */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#DDA76A]" />
          </div>
        ) : (
          <>
            {/* Relatório Geral */}
            {reportType === 'general' && data && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-crm-bg-secondary rounded-lg border border-crm-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-crm-text-primary mb-1">
                    {data.properties.total}
                  </h3>
                  <p className="text-sm text-crm-text-muted">Total de Imóveis</p>
                  <div className="mt-4 space-y-1">
                    <p className="text-xs text-crm-text-secondary">
                      Disponíveis: {data.properties.available}
                    </p>
                    <p className="text-xs text-crm-text-secondary">Vendidos: {data.properties.sold}</p>
                    <p className="text-xs text-crm-text-secondary">Alugados: {data.properties.rented}</p>
                  </div>
                </div>

                <div className="bg-crm-bg-secondary rounded-lg border border-crm-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-crm-text-primary mb-1">
                    {data.leads.total}
                  </h3>
                  <p className="text-sm text-crm-text-muted">Total de Leads</p>
                  <div className="mt-4 space-y-1">
                    <p className="text-xs text-crm-text-secondary">
                      Qualificados: {data.leads.qualified}
                    </p>
                    <p className="text-xs text-crm-text-secondary">Fechados: {data.leads.closed}</p>
                  </div>
                </div>

                <div className="bg-crm-bg-secondary rounded-lg border border-crm-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-crm-text-primary mb-1">
                    {data.tasks.total}
                  </h3>
                  <p className="text-sm text-crm-text-muted">Total de Tarefas</p>
                  <div className="mt-4 space-y-1">
                    <p className="text-xs text-crm-text-secondary">
                      Concluídas: {data.tasks.completed}
                    </p>
                  </div>
                </div>

                <div className="bg-crm-bg-secondary rounded-lg border border-crm-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-crm-text-primary mb-1">
                    {data.visits.total}
                  </h3>
                  <p className="text-sm text-crm-text-muted">Total de Visitas</p>
                </div>
              </div>
            )}

            {/* Relatório de Vendas */}
            {reportType === 'sales' && data && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-crm-bg-secondary rounded-lg border border-crm-border p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <p className="text-sm text-crm-text-muted">Total Vendido</p>
                    </div>
                    <h3 className="text-2xl font-bold text-crm-text-primary">
                      {formatCurrency(data.stats.totalValue)}
                    </h3>
                  </div>

                  <div className="bg-crm-bg-secondary rounded-lg border border-crm-border p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      <p className="text-sm text-crm-text-muted">Ticket Médio</p>
                    </div>
                    <h3 className="text-2xl font-bold text-crm-text-primary">
                      {formatCurrency(data.stats.averageValue)}
                    </h3>
                  </div>

                  <div className="bg-crm-bg-secondary rounded-lg border border-crm-border p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-5 h-5 text-purple-400" />
                      <p className="text-sm text-crm-text-muted">Imóveis Vendidos</p>
                    </div>
                    <h3 className="text-2xl font-bold text-crm-text-primary">
                      {data.stats.total}
                    </h3>
                  </div>
                </div>

                <div className="bg-crm-bg-secondary rounded-lg border border-crm-border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-crm-bg-elevated border-b border-crm-border">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                            Código
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                            Imóvel
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                            Valor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                            Corretor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                            Data
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-crm-border">
                        {data.sales.map((sale: any) => (
                          <tr key={sale.id} className="hover:bg-crm-bg-hover">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-crm-text-primary">
                              {sale.code}
                            </td>
                            <td className="px-6 py-4 text-sm text-crm-text-primary">
                              {sale.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-crm-text-secondary">
                              {sale.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">
                              {formatCurrency(sale.price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-crm-text-secondary">
                              {sale.user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-crm-text-muted">
                              {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Relatório de Leads */}
            {reportType === 'leads' && data && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-crm-bg-secondary rounded-lg border border-crm-border p-6">
                    <h3 className="text-sm font-medium text-crm-text-secondary mb-4">
                      Por Status
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(data.stats.byStatus).map(([status, count]: any) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm text-crm-text-primary">{status}</span>
                          <span className="text-sm font-semibold text-crm-text-primary">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-crm-bg-secondary rounded-lg border border-crm-border p-6">
                    <h3 className="text-sm font-medium text-crm-text-secondary mb-4">
                      Por Origem
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(data.stats.bySource).map(([source, count]: any) => (
                        <div key={source} className="flex items-center justify-between">
                          <span className="text-sm text-crm-text-primary">{source}</span>
                          <span className="text-sm font-semibold text-crm-text-primary">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-crm-bg-secondary rounded-lg border border-crm-border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-crm-bg-elevated border-b border-crm-border">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                            Contato
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                            Origem
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                            Corretor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                            Data
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-crm-border">
                        {data.leads.map((lead: any) => (
                          <tr key={lead.id} className="hover:bg-crm-bg-hover">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-crm-text-primary">
                              {lead.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-crm-text-secondary">
                              <div>{lead.phone}</div>
                              {lead.email && (
                                <div className="text-xs text-crm-text-muted">{lead.email}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                                {lead.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-crm-text-secondary">
                              {lead.source}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-crm-text-secondary">
                              {lead.user?.name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-crm-text-muted">
                              {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Relatório de Performance */}
            {reportType === 'performance' && data && (
              <div className="bg-crm-bg-secondary rounded-lg border border-crm-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-crm-bg-elevated border-b border-crm-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                          Função
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                          Imóveis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                          Leads
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                          Leads Fechados
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                          Tarefas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-crm-text-secondary uppercase tracking-wider">
                          Tarefas Concluídas
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-crm-border">
                      {data.users.map((user: any) => (
                        <tr key={user.id} className="hover:bg-crm-bg-hover">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-crm-text-primary">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-crm-text-secondary">
                            {user.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-crm-text-primary">
                            {user.stats.properties}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-crm-text-primary">
                            {user.stats.leads}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">
                            {user.stats.closedLeads}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-crm-text-primary">
                            {user.stats.tasks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-400">
                            {user.stats.completedTasks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CRMLayout>
  )
}
