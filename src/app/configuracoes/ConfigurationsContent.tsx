'use client'

import { useState, useEffect, useCallback } from 'react'
import { CRMLayout } from '@/components/layout'
import {
  Settings,
  Save,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Bell,
  Mail,
  DollarSign,
  Globe,
  Shield,
  Database,
} from 'lucide-react'

interface ConfigurationsContentProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

interface Configuration {
  id: string
  key: string
  value: string
  type: string
  category?: string
  label: string
  description?: string
  createdAt: string
  updatedAt: string
}

const categories = [
  { value: 'geral', label: 'Geral', icon: Globe },
  { value: 'notificacoes', label: 'Notificações', icon: Bell },
  { value: 'email', label: 'E-mail', icon: Mail },
  { value: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { value: 'seguranca', label: 'Segurança', icon: Shield },
  { value: 'integracao', label: 'Integrações', icon: Database },
]

export default function ConfigurationsContent({ user }: ConfigurationsContentProps) {
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('geral')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null)
  const [saving, setSaving] = useState(false)

  const [addForm, setAddForm] = useState({
    key: '',
    value: '',
    type: 'STRING',
    category: 'geral',
    label: '',
    description: '',
  })

  const isAdmin = user.role === 'ADMIN'

  const fetchConfigurations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)

      const res = await fetch(`/api/configurations?${params}`)
      const data = await res.json()
      setConfigurations(data.configurations || [])
    } catch (error) {
      console.error('Error fetching configurations:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchConfigurations()
  }, [fetchConfigurations])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })

      if (res.ok) {
        setShowAddModal(false)
        setAddForm({
          key: '',
          value: '',
          type: 'STRING',
          category: 'geral',
          label: '',
          description: '',
        })
        fetchConfigurations()
      }
    } catch (error) {
      console.error('Error adding configuration:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedConfig) return

    setSaving(true)
    try {
      const res = await fetch(`/api/configurations/${selectedConfig.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: selectedConfig.value,
          label: selectedConfig.label,
          description: selectedConfig.description,
        }),
      })

      if (res.ok) {
        setShowEditModal(false)
        setSelectedConfig(null)
        fetchConfigurations()
      }
    } catch (error) {
      console.error('Error updating configuration:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta configuração?')) return

    try {
      const res = await fetch(`/api/configurations/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchConfigurations()
      }
    } catch (error) {
      console.error('Error deleting configuration:', error)
    }
  }

  return (
    <CRMLayout title="Configurações" user={user}>
      <div className="space-y-6">
        {/* Tabs de Categorias */}
        <div className="bg-crm-bg-secondary rounded-lg border border-crm-border p-2">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-[#DDA76A] text-white'
                      : 'text-crm-text-muted hover:bg-crm-bg-hover hover:text-crm-text-primary'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-crm-text-primary">
              {categories.find((c) => c.value === selectedCategory)?.label}
            </h2>
            <p className="text-sm text-crm-text-muted mt-1">
              Gerencie as configurações do sistema
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#DDA76A] hover:bg-[#C89659] text-white rounded-lg transition-colors"
            >
              <Plus size={18} />
              Nova Configuração
            </button>
          )}
        </div>

        {/* Lista de Configurações */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#DDA76A]" />
          </div>
        ) : configurations.length === 0 ? (
          <div className="text-center py-12 bg-crm-bg-secondary rounded-lg border border-crm-border">
            <Settings className="w-16 h-16 mx-auto text-crm-text-muted mb-4" />
            <p className="text-crm-text-muted">Nenhuma configuração encontrada</p>
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-[#DDA76A] hover:underline"
              >
                Adicionar primeira configuração
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {configurations.map((config) => (
              <div
                key={config.id}
                className="bg-crm-bg-secondary rounded-lg border border-crm-border p-6 hover:bg-crm-bg-hover transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-crm-text-primary">
                        {config.label}
                      </h3>
                      <span className="px-2 py-0.5 text-xs rounded bg-crm-bg-elevated text-crm-text-muted">
                        {config.type}
                      </span>
                    </div>
                    {config.description && (
                      <p className="text-sm text-crm-text-secondary mb-3">
                        {config.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-crm-text-muted">Chave:</span>{' '}
                        <code className="px-2 py-0.5 bg-crm-bg-elevated rounded text-crm-text-primary font-mono text-xs">
                          {config.key}
                        </code>
                      </div>
                      <div className="text-sm">
                        <span className="text-crm-text-muted">Valor:</span>{' '}
                        <span className="text-crm-text-primary font-medium">
                          {config.type === 'BOOLEAN'
                            ? config.value === 'true'
                              ? 'Sim'
                              : 'Não'
                            : config.value}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedConfig(config)
                          setShowEditModal(true)
                        }}
                        className="p-2 hover:bg-crm-bg-elevated rounded-lg text-crm-text-muted hover:text-blue-400 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="p-2 hover:bg-crm-bg-elevated rounded-lg text-crm-text-muted hover:text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Adicionar */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-crm-bg-secondary rounded-lg border border-crm-border w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-crm-border">
                <h2 className="text-xl font-semibold text-crm-text-primary">
                  Nova Configuração
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-crm-bg-hover rounded-lg transition-colors"
                >
                  <X size={20} className="text-crm-text-muted" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Chave *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.key}
                    onChange={(e) => setAddForm({ ...addForm, key: e.target.value })}
                    placeholder="ex: max_file_size"
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.label}
                    onChange={(e) => setAddForm({ ...addForm, label: e.target.value })}
                    placeholder="ex: Tamanho Máximo de Arquivo"
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                      Tipo *
                    </label>
                    <select
                      required
                      value={addForm.type}
                      onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                      className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                    >
                      <option value="STRING">String</option>
                      <option value="NUMBER">Número</option>
                      <option value="BOOLEAN">Booleano</option>
                      <option value="JSON">JSON</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                      Categoria *
                    </label>
                    <select
                      required
                      value={addForm.category}
                      onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                      className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                      Valor *
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.value}
                      onChange={(e) => setAddForm({ ...addForm, value: e.target.value })}
                      className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-crm-border rounded-lg text-crm-text-primary hover:bg-crm-bg-hover transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-[#DDA76A] hover:bg-[#C89659] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Salvar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Editar */}
        {showEditModal && selectedConfig && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-crm-bg-secondary rounded-lg border border-crm-border w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-crm-border">
                <h2 className="text-xl font-semibold text-crm-text-primary">
                  Editar Configuração
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedConfig(null)
                  }}
                  className="p-2 hover:bg-crm-bg-hover rounded-lg transition-colors"
                >
                  <X size={20} className="text-crm-text-muted" />
                </button>
              </div>

              <form onSubmit={handleEdit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Chave
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedConfig.key}
                    className="w-full px-4 py-2 bg-crm-bg-elevated border border-crm-border rounded-lg text-crm-text-muted font-mono cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedConfig.label}
                    onChange={(e) =>
                      setSelectedConfig({ ...selectedConfig, label: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={selectedConfig.description || ''}
                    onChange={(e) =>
                      setSelectedConfig({ ...selectedConfig, description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Valor *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedConfig.value}
                    onChange={(e) =>
                      setSelectedConfig({ ...selectedConfig, value: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedConfig(null)
                    }}
                    className="flex-1 px-4 py-2 border border-crm-border rounded-lg text-crm-text-primary hover:bg-crm-bg-hover transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-[#DDA76A] hover:bg-[#C89659] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Salvar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </CRMLayout>
  )
}
