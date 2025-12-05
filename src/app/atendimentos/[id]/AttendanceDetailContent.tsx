'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  DocumentTextIcon,
  HomeIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import CRMLayout from '@/components/layout/CRMLayout'

interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  cpf: string | null
  source: string
  status: string
  message: string | null
  budget: number | null
  interestType: string | null
  preferredNeighborhoods: string[]
  score: number
  createdAt: Date
  updatedAt: Date
  property: {
    id: string
    code: string | null
    title: string
    type: string
    price: number | null
    neighborhood: string | null
    city: string | null
    images: string[]
  } | null
  user: {
    id: string
    name: string | null
    email: string | null
  } | null
  activities: Array<{
    id: string
    type: string
    description: string
    metadata: any
    createdAt: Date
  }>
  visits: Array<{
    id: string
    scheduledAt: Date
    completedAt: Date | null
    status: string
    notes: string | null
    feedback: string | null
  }>
}

interface User {
  id?: string
  name?: string | null
  email?: string | null
  role?: string
}

interface Props {
  lead: Lead
  user: User
}

const sourceLabels: Record<string, string> = {
  SITE: 'Site',
  WHATSAPP: 'WhatsApp',
  INDICACAO: 'Indicação',
  PORTAL_ZAP: 'Portal Zap',
  PORTAL_VIVAREAL: 'Portal VivaReal',
  PORTAL_OLX: 'Portal OLX',
  REDES_SOCIAIS: 'Redes Sociais',
  TELEFONE: 'Telefone',
  VISITA_ESCRITORIO: 'Visita ao Escritório',
  OUTRO: 'Outro',
}

const statusLabels: Record<string, string> = {
  NOVO: 'Novo',
  CONTATO_REALIZADO: 'Contato Realizado',
  QUALIFICADO: 'Qualificado',
  VISITA_AGENDADA: 'Visita Agendada',
  PROPOSTA_ENVIADA: 'Proposta Enviada',
  NEGOCIACAO: 'Negociação',
  FECHADO_GANHO: 'Fechado (Ganho)',
  FECHADO_PERDIDO: 'Fechado (Perdido)',
}

const statusColors: Record<string, string> = {
  NOVO: 'bg-blue-100 text-blue-800',
  CONTATO_REALIZADO: 'bg-cyan-100 text-cyan-800',
  QUALIFICADO: 'bg-purple-100 text-purple-800',
  VISITA_AGENDADA: 'bg-amber-100 text-amber-800',
  PROPOSTA_ENVIADA: 'bg-orange-100 text-orange-800',
  NEGOCIACAO: 'bg-indigo-100 text-indigo-800',
  FECHADO_GANHO: 'bg-green-100 text-green-800',
  FECHADO_PERDIDO: 'bg-red-100 text-red-800',
}

const activityTypeLabels: Record<string, string> = {
  LEAD_CRIADO: 'Lead Criado',
  LEAD_ATUALIZADO: 'Lead Atualizado',
  LEAD_STATUS_ALTERADO: 'Status Alterado',
  CONTATO_REALIZADO: 'Contato Realizado',
  VISITA_AGENDADA: 'Visita Agendada',
  VISITA_REALIZADA: 'Visita Realizada',
  PROPOSTA_ENVIADA: 'Proposta Enviada',
  NEGOCIACAO_INICIADA: 'Negociação Iniciada',
  VENDA_REALIZADA: 'Venda Realizada',
  COMENTARIO_ADICIONADO: 'Comentário Adicionado',
}

const visitStatusLabels: Record<string, string> = {
  AGENDADA: 'Agendada',
  CONFIRMADA: 'Confirmada',
  REALIZADA: 'Realizada',
  CANCELADA: 'Cancelada',
  REMARCADA: 'Remarcada',
  NAO_COMPARECEU: 'Não Compareceu',
}

const visitStatusColors: Record<string, string> = {
  AGENDADA: 'bg-blue-100 text-blue-800',
  CONFIRMADA: 'bg-green-100 text-green-800',
  REALIZADA: 'bg-emerald-100 text-emerald-800',
  CANCELADA: 'bg-red-100 text-red-800',
  REMARCADA: 'bg-amber-100 text-amber-800',
  NAO_COMPARECEU: 'bg-gray-100 text-gray-800',
}

export default function AttendanceDetailContent({ lead, user }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'info' | 'activities' | 'visits'>('info')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState(lead.status)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR')
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return 'Não informado'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatPhone = (phone: string | null) => {
    if (!phone) return 'Não informado'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  const getTimeAgo = (date: Date | string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `há ${diffMins} min`
    if (diffHours < 24) return `há ${diffHours}h`
    if (diffDays < 7) return `há ${diffDays} dias`
    return formatDate(date)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.push('/atendimentos')
      } else {
        alert('Erro ao excluir atendimento')
      }
    } catch (error) {
      alert('Erro ao excluir atendimento')
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async () => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        router.refresh()
        setShowStatusModal(false)
      } else {
        alert('Erro ao atualizar status')
      }
    } catch (error) {
      alert('Erro ao atualizar status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-red-600'
  }

  const tabs = [
    { id: 'info', label: 'Informações', icon: DocumentTextIcon },
    { id: 'activities', label: 'Atividades', icon: ClockIcon },
    { id: 'visits', label: 'Visitas', icon: EyeIcon },
  ]

  return (
    <CRMLayout user={user} title="Detalhes do Atendimento">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/atendimentos"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[lead.status] || 'bg-gray-100 text-gray-800'}`}>
                  {statusLabels[lead.status] || lead.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span>Criado em {formatDate(lead.createdAt)}</span>
                <span>•</span>
                <span>Origem: {sourceLabels[lead.source] || lead.source}</span>
                <span>•</span>
                <span className={`font-semibold ${getScoreColor(lead.score)}`}>
                  Score: {lead.score}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Alterar Status
            </button>
            <Link
              href={`/atendimentos/${lead.id}/editar`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Editar
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
            >
              <TrashIcon className="w-4 h-4" />
              Excluir
            </button>
          </div>
        </div>

        {/* Quick Contact Actions */}
        <div className="flex items-center gap-3 mb-6">
          {lead.phone && (
            <>
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                <PhoneIcon className="w-4 h-4" />
                Ligar
              </a>
              <a
                href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20BD5C] text-sm font-medium"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                WhatsApp
              </a>
            </>
          )}
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <EnvelopeIcon className="w-4 h-4" />
              E-mail
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <UserIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nome</p>
                      <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <PhoneIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Telefone</p>
                      <p className="text-sm font-medium text-gray-900">{formatPhone(lead.phone)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">E-mail</p>
                      <p className="text-sm font-medium text-gray-900">{lead.email || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CPF</p>
                      <p className="text-sm font-medium text-gray-900">{lead.cpf || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interest Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interesse</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <HomeIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tipo de Interesse</p>
                      <p className="text-sm font-medium text-gray-900">
                        {lead.interestType === 'COMPRA' ? 'Compra' : 
                         lead.interestType === 'ALUGUEL' ? 'Aluguel' : 
                         lead.interestType || 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <CurrencyDollarIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Orçamento</p>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(lead.budget)}</p>
                    </div>
                  </div>
                </div>

                {lead.preferredNeighborhoods && lead.preferredNeighborhoods.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Bairros de Preferência</p>
                    <div className="flex flex-wrap gap-2">
                      {lead.preferredNeighborhoods.map((neighborhood, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {neighborhood}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {lead.message && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Mensagem</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {lead.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Property Card */}
              {lead.property && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Imóvel de Interesse</h3>
                  <Link href={`/imoveis/${lead.property.id}`} className="block group">
                    {lead.property.images && lead.property.images[0] && (
                      <div className="aspect-video rounded-lg overflow-hidden mb-3">
                        <img
                          src={lead.property.images[0]}
                          alt={lead.property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <p className="text-xs text-amber-600 font-medium mb-1">
                      {lead.property.code || 'Sem código'}
                    </p>
                    <p className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                      {lead.property.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {lead.property.neighborhood}, {lead.property.city}
                    </p>
                    <p className="text-lg font-bold text-amber-600 mt-2">
                      {formatCurrency(lead.property.price)}
                    </p>
                  </Link>
                </div>
              )}

              {/* Assigned User */}
              {lead.user && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Corretor Responsável</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 font-semibold">
                        {lead.user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{lead.user.name || 'Sem nome'}</p>
                      <p className="text-sm text-gray-500">{lead.user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Criado em</span>
                    <span className="font-medium text-gray-900">{formatDate(lead.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Última atualização</span>
                    <span className="font-medium text-gray-900">{formatDate(lead.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Atividades</span>
                    <span className="font-medium text-gray-900">{lead.activities.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Visitas</span>
                    <span className="font-medium text-gray-900">{lead.visits.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Histórico de Atividades</h3>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100">
                <PlusIcon className="w-4 h-4" />
                Nova Atividade
              </button>
            </div>

            {lead.activities.length === 0 ? (
              <div className="text-center py-12">
                <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma atividade registrada</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-6">
                  {lead.activities.map((activity) => (
                    <div key={activity.id} className="relative flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center z-10">
                        <ClockIcon className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">
                            {activityTypeLabels[activity.type] || activity.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(activity.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Visitas Agendadas</h3>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100">
                <PlusIcon className="w-4 h-4" />
                Agendar Visita
              </button>
            </div>

            {lead.visits.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma visita agendada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lead.visits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <CalendarIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDateTime(visit.scheduledAt)}
                        </p>
                        {visit.notes && (
                          <p className="text-sm text-gray-500 mt-1">{visit.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          visitStatusColors[visit.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {visitStatusLabels[visit.status] || visit.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Excluir Atendimento</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o atendimento de <strong>{lead.name}</strong>? 
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Status</h3>
            <div className="space-y-2 mb-6">
              {Object.entries(statusLabels).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setNewStatus(value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    newStatus === value
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full mr-3 ${statusColors[value]?.split(' ')[0] || 'bg-gray-300'}`} />
                  {label}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleStatusChange}
                disabled={updatingStatus || newStatus === lead.status}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {updatingStatus ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  )
}
