'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Home,
  MapPin,
  Star,
} from 'lucide-react'
import { CRMLayout } from '@/components/layout'
import { formStyles, getInputClassName, getSelectClassName, getTextareaClassName } from '@/components/ui/form-elements'

interface Property {
  id: string
  code: string | null
  title: string
  type: string
  neighborhoodRef?: { id: string; name: string } | null
}

interface UserOption {
  id: string
  name: string | null
  email: string | null
}

interface User {
  id?: string
  name?: string | null
  email?: string | null
  role?: string
}

interface Props {
  user: User
  properties: Property[]
  users: UserOption[]
}

const sourceOptions = [
  { value: 'SITE', label: 'Site' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'INDICACAO', label: 'Indicação' },
  { value: 'PORTAL_ZAP', label: 'Portal Zap' },
  { value: 'PORTAL_VIVAREAL', label: 'Portal VivaReal' },
  { value: 'PORTAL_OLX', label: 'Portal OLX' },
  { value: 'REDES_SOCIAIS', label: 'Redes Sociais' },
  { value: 'TELEFONE', label: 'Telefone' },
  { value: 'VISITA_ESCRITORIO', label: 'Visita ao Escritório' },
  { value: 'OUTRO', label: 'Outro' },
]

const statusOptions = [
  { value: 'NOVO', label: 'Novo' },
  { value: 'CONTATO_REALIZADO', label: 'Contato Realizado' },
  { value: 'QUALIFICADO', label: 'Qualificado' },
  { value: 'VISITA_AGENDADA', label: 'Visita Agendada' },
  { value: 'PROPOSTA_ENVIADA', label: 'Proposta Enviada' },
  { value: 'NEGOCIACAO', label: 'Negociação' },
  { value: 'FECHADO_GANHO', label: 'Fechado (Ganho)' },
  { value: 'FECHADO_PERDIDO', label: 'Fechado (Perdido)' },
]

const interestTypeOptions = [
  { value: '', label: 'Selecione...' },
  { value: 'COMPRA', label: 'Compra' },
  { value: 'ALUGUEL', label: 'Aluguel' },
]

export default function AttendanceFormContent({ user, properties, users }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [neighborhoodInput, setNeighborhoodInput] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    source: 'SITE',
    status: 'NOVO',
    message: '',
    budget: '',
    interestType: '',
    preferredNeighborhoods: [] as string[],
    score: 50,
    propertyId: '',
    userId: user.id || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddNeighborhood = () => {
    if (neighborhoodInput.trim() && !formData.preferredNeighborhoods.includes(neighborhoodInput.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredNeighborhoods: [...prev.preferredNeighborhoods, neighborhoodInput.trim()]
      }))
      setNeighborhoodInput('')
    }
  }

  const handleRemoveNeighborhood = (neighborhood: string) => {
    setFormData(prev => ({
      ...prev,
      preferredNeighborhoods: prev.preferredNeighborhoods.filter(n => n !== neighborhood)
    }))
  }

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
  }

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
  }

  const formatCurrency = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (!cleaned) return ''
    const number = parseInt(cleaned, 10) / 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(number)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone ? formData.phone.replace(/\D/g, '') : null,
        cpf: formData.cpf ? formData.cpf.replace(/\D/g, '') : null,
        source: formData.source,
        status: formData.status,
        message: formData.message || null,
        budget: formData.budget ? parseFloat(formData.budget.replace(/\D/g, '')) / 100 : null,
        interestType: formData.interestType || null,
        preferredNeighborhoods: formData.preferredNeighborhoods,
        score: Number(formData.score),
        propertyId: formData.propertyId || null,
        userId: formData.userId || null,
      }

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const lead = await response.json()
        router.push(`/atendimentos/${lead.id}`)
      } else {
        const error = await response.json()
        alert(error.message || 'Erro ao cadastrar atendimento')
      }
    } catch (error) {
      alert('Erro ao cadastrar atendimento')
    } finally {
      setSaving(false)
    }
  }

  return (
    <CRMLayout user={user} title="Novo Atendimento">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/atendimentos"
            className="p-2 text-crm-text-muted hover:text-crm-text-secondary hover:bg-crm-bg-hover rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Novo Atendimento</h1>
            <p className="text-sm text-crm-text-muted mt-1">Cadastre um novo lead/atendimento</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Info */}
          <div className="bg-crm-bg-surface rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={formStyles.input}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formStyles.input}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formatPhone(formData.phone)}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                  className={formStyles.input}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formatCPF(formData.cpf)}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value.replace(/\D/g, '') }))}
                  maxLength={14}
                  className={formStyles.input}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          </div>

          {/* Status and Source */}
          <div className="bg-crm-bg-surface rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              Status e Origem
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className={formStyles.input}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                  Origem <span className="text-red-500">*</span>
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                  className={formStyles.input}
                >
                  {sourceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                  Score (0-100)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    name="score"
                    value={formData.score}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="w-12 text-center font-medium text-crm-text-secondary">{formData.score}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interest Info */}
          <div className="bg-crm-bg-surface rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-amber-500" />
              Interesse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                  Tipo de Interesse
                </label>
                <select
                  name="interestType"
                  value={formData.interestType}
                  onChange={handleChange}
                  className={formStyles.input}
                >
                  {interestTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                  Orçamento
                </label>
                <input
                  type="text"
                  name="budget"
                  value={formData.budget ? formatCurrency(formData.budget) : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value.replace(/\D/g, '') }))}
                  className={formStyles.input}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                Bairros de Preferência
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={neighborhoodInput}
                  onChange={(e) => setNeighborhoodInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNeighborhood())}
                  className={formStyles.input}
                  placeholder="Digite um bairro e pressione Enter"
                />
                <button
                  type="button"
                  onClick={handleAddNeighborhood}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  Adicionar
                </button>
              </div>
              {formData.preferredNeighborhoods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.preferredNeighborhoods.map((neighborhood, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-crm-bg-hover text-crm-text-secondary rounded-full text-sm"
                    >
                      {neighborhood}
                      <button
                        type="button"
                        onClick={() => handleRemoveNeighborhood(neighborhood)}
                        className="ml-1 text-crm-text-muted hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                Mensagem
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className={formStyles.input}
                placeholder="Mensagem ou observações do cliente..."
              />
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-crm-bg-surface rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Atribuição
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                  Imóvel de Interesse
                </label>
                <select
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  className={formStyles.input}
                >
                  <option value="">Selecione um imóvel...</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.code ? `${property.code} - ` : ''}{property.title} ({property.neighborhoodRef?.name || 'Sem bairro'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                  Corretor Responsável
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className={formStyles.input}
                >
                  <option value="">Selecione um corretor...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link
              href="/atendimentos"
              className="px-6 py-3 text-crm-text-secondary bg-crm-bg-hover rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Cadastrar Atendimento'}
            </button>
          </div>
        </form>
      </div>
    </CRMLayout>
  )
}
