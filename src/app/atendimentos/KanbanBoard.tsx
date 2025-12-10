'use client'

import Link from 'next/link'
import {
  Phone,
  Mail,
  MessageSquare,
  User,
  Calendar,
  Clock,
  Star,
  ArrowRight,
  MoreVertical,
} from 'lucide-react'

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
}

interface KanbanBoardProps {
  leads: Lead[]
  onUpdateStatus: (leadId: string, newStatus: string) => void
}

const statusColumns = [
  { id: 'NOVO', label: 'Novos', color: 'bg-blue-500' },
  { id: 'CONTATO_REALIZADO', label: 'Contato Realizado', color: 'bg-cyan-500' },
  { id: 'QUALIFICADO', label: 'Qualificados', color: 'bg-purple-500' },
  { id: 'VISITA_AGENDADA', label: 'Visita Agendada', color: 'bg-amber-500' },
  { id: 'PROPOSTA_ENVIADA', label: 'Proposta Enviada', color: 'bg-orange-500' },
  { id: 'NEGOCIACAO', label: 'Em Negociação', color: 'bg-indigo-500' },
  { id: 'FECHADO_GANHO', label: 'Ganhos', color: 'bg-green-500' },
  { id: 'FECHADO_PERDIDO', label: 'Perdidos', color: 'bg-red-500' },
]

const sourceLabels: Record<string, string> = {
  SITE: 'Site',
  WHATSAPP: 'WhatsApp',
  INDICACAO: 'Indicação',
  PORTAL_ZAP: 'Zap',
  PORTAL_VIVAREAL: 'VivaReal',
  PORTAL_OLX: 'OLX',
  REDES_SOCIAIS: 'Redes Sociais',
  TELEFONE: 'Telefone',
  VISITA_ESCRITORIO: 'Escritório',
  OUTRO: 'Outro',
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

const formatCurrency = (value: number | null) => {
  if (!value) return null
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
  }).format(value)
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

export default function KanbanBoard({ leads, onUpdateStatus }: KanbanBoardProps) {
  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status)
  }

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    if (leadId) {
      onUpdateStatus(leadId, status)
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
      {statusColumns.map((column) => {
        const columnLeads = getLeadsByStatus(column.id)
        
        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-[300px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className={`${column.color} rounded-t-lg px-4 py-3`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-sm">
                  {column.label}
                </h3>
                <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {columnLeads.length}
                </span>
              </div>
            </div>

            {/* Cards Container */}
            <div className="bg-gray-100 rounded-b-lg p-2 min-h-[500px] space-y-2">
              {columnLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-move hover:shadow-md transition-shadow"
                >
                  {/* Lead Header */}
                  <div className="flex items-start justify-between mb-2">
                    <Link
                      href={`/atendimentos/${lead.id}`}
                      className="font-medium text-gray-900 hover:text-amber-600 text-sm line-clamp-1"
                    >
                      {lead.name}
                    </Link>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-semibold ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </span>
                      <Star className="w-3 h-3 text-amber-400" />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 mb-3">
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        <span className="truncate">{lead.phone}</span>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Property */}
                  {lead.property && (
                    <div className="bg-gray-50 rounded px-2 py-1 mb-2">
                      <p className="text-xs text-gray-600 truncate">
                        🏠 {lead.property.code || lead.property.title}
                      </p>
                    </div>
                  )}

                  {/* Budget */}
                  {lead.budget && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-green-600">
                        {formatCurrency(lead.budget)}
                      </span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {sourceLabels[lead.source] || lead.source}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {formatDate(lead.createdAt)}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                    {lead.phone && (
                      <a
                        href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] text-green-600 hover:bg-green-50 rounded transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageSquare className="w-3 h-3" />
                        WhatsApp
                      </a>
                    )}
                    <Link
                      href={`/atendimentos/${lead.id}`}
                      className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowRight className="w-3 h-3" />
                      Ver
                    </Link>
                  </div>
                </div>
              ))}

              {columnLeads.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Nenhum lead
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
