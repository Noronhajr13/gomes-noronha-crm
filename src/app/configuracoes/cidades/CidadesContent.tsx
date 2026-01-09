'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { CRMLayout } from '@/components/layout'
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Save,
  ArrowLeft,
  Building2
} from 'lucide-react'

interface CidadesContentProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

interface City {
  id: string
  name: string
  state: string
  active: boolean
  createdAt: string
  _count?: {
    neighborhoods: number
  }
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO'
]

export default function CidadesContent({ user }: CidadesContentProps) {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    state: 'MG',
  })

  const fetchCities = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cities?includeInactive=true')
      const data = await res.json()
      setCities(data.cities || [])
    } catch (error) {
      console.error('Erro ao buscar cidades:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCities()
  }, [fetchCities])

  const handleOpenModal = (city?: City) => {
    if (city) {
      setEditingCity(city)
      setFormData({
        name: city.name,
        state: city.state,
      })
    } else {
      setEditingCity(null)
      setFormData({ name: '', state: 'MG' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCity(null)
    setFormData({ name: '', state: 'MG' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingCity
        ? `/api/cities/${editingCity.id}`
        : '/api/cities'
      const method = editingCity ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        handleCloseModal()
        fetchCities()
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao salvar cidade')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar cidade')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (city: City) => {
    if (!confirm(`Deseja realmente excluir a cidade "${city.name}"?`)) return

    try {
      const res = await fetch(`/api/cities/${city.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchCities()
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao excluir cidade')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir cidade')
    }
  }

  const handleToggleActive = async (city: City) => {
    try {
      await fetch(`/api/cities/${city.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !city.active }),
      })
      fetchCities()
    } catch (error) {
      console.error('Erro ao atualizar:', error)
    }
  }

  return (
    <CRMLayout title="Cidades" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/configuracoes"
              className="p-2 hover:bg-crm-bg-hover rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-crm-text-muted" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-crm-text-primary">Cidades</h1>
              <p className="text-sm text-crm-text-muted">Gerenciar cidades cadastradas</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA76A] hover:bg-[#C89659] text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            Nova Cidade
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#DDA76A]" />
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-12 bg-crm-bg-secondary rounded-lg border border-crm-border">
            <MapPin className="w-16 h-16 mx-auto text-crm-text-muted mb-4" />
            <p className="text-crm-text-muted">Nenhuma cidade cadastrada</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-[#DDA76A] hover:underline"
            >
              Cadastrar primeira cidade
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => (
              <div
                key={city.id}
                className={`bg-crm-bg-secondary rounded-lg border border-crm-border p-6 hover:bg-crm-bg-hover transition-colors ${
                  !city.active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#DDA76A]/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#DDA76A]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-crm-text-primary">
                        {city.name}
                      </h3>
                      <p className="text-sm text-crm-text-muted">{city.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(city)}
                      className="p-2 hover:bg-crm-bg-elevated rounded-lg text-crm-text-muted hover:text-blue-400 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(city)}
                      className="p-2 hover:bg-crm-bg-elevated rounded-lg text-crm-text-muted hover:text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-crm-text-muted">
                    <Building2 size={14} />
                    <span>{city._count?.neighborhoods || 0} bairro(s)</span>
                  </div>
                  <button
                    onClick={() => handleToggleActive(city)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      city.active
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}
                  >
                    {city.active ? 'Ativa' : 'Inativa'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-crm-bg-secondary rounded-lg border border-crm-border w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-crm-border">
                <h2 className="text-xl font-semibold text-crm-text-primary">
                  {editingCity ? 'Editar Cidade' : 'Nova Cidade'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-crm-bg-hover rounded-lg transition-colors"
                >
                  <X size={20} className="text-crm-text-muted" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Nome da Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Juiz de Fora"
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Estado *
                  </label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  >
                    {brazilianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
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
