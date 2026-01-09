'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { CRMLayout } from '@/components/layout'
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Save,
  ArrowLeft,
  MapPin
} from 'lucide-react'

interface BairrosContentProps {
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
}

interface Neighborhood {
  id: string
  name: string
  cityId: string
  city: City
  active: boolean
  order: number
  createdAt: string
}

export default function BairrosContent({ user }: BairrosContentProps) {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingNeighborhood, setEditingNeighborhood] = useState<Neighborhood | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedCityId, setSelectedCityId] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    cityId: '',
  })

  const fetchCities = useCallback(async () => {
    try {
      const res = await fetch('/api/cities')
      const data = await res.json()
      setCities(data.cities || [])
      // Selecionar primeira cidade por padrão
      if (data.cities?.length > 0 && !selectedCityId) {
        setSelectedCityId(data.cities[0].id)
      }
    } catch (error) {
      console.error('Erro ao buscar cidades:', error)
    }
  }, [selectedCityId])

  const fetchNeighborhoods = useCallback(async () => {
    if (!selectedCityId) return

    setLoading(true)
    try {
      const res = await fetch(`/api/neighborhoods?cityId=${selectedCityId}&includeInactive=true`)
      const data = await res.json()
      setNeighborhoods(data.neighborhoods || [])
    } catch (error) {
      console.error('Erro ao buscar bairros:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCityId])

  useEffect(() => {
    fetchCities()
  }, [fetchCities])

  useEffect(() => {
    if (selectedCityId) {
      fetchNeighborhoods()
    }
  }, [selectedCityId, fetchNeighborhoods])

  const handleOpenModal = (neighborhood?: Neighborhood) => {
    if (neighborhood) {
      setEditingNeighborhood(neighborhood)
      setFormData({
        name: neighborhood.name,
        cityId: neighborhood.cityId,
      })
    } else {
      setEditingNeighborhood(null)
      setFormData({ name: '', cityId: selectedCityId })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingNeighborhood(null)
    setFormData({ name: '', cityId: selectedCityId })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingNeighborhood
        ? `/api/neighborhoods/${editingNeighborhood.id}`
        : '/api/neighborhoods'
      const method = editingNeighborhood ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        handleCloseModal()
        fetchNeighborhoods()
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao salvar bairro')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar bairro')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (neighborhood: Neighborhood) => {
    if (!confirm(`Deseja realmente excluir o bairro "${neighborhood.name}"?`)) return

    try {
      const res = await fetch(`/api/neighborhoods/${neighborhood.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchNeighborhoods()
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao excluir bairro')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir bairro')
    }
  }

  const handleToggleActive = async (neighborhood: Neighborhood) => {
    try {
      await fetch(`/api/neighborhoods/${neighborhood.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !neighborhood.active }),
      })
      fetchNeighborhoods()
    } catch (error) {
      console.error('Erro ao atualizar:', error)
    }
  }

  const selectedCity = cities.find(c => c.id === selectedCityId)

  return (
    <CRMLayout title="Bairros" user={user}>
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
              <h1 className="text-2xl font-bold text-crm-text-primary">Bairros</h1>
              <p className="text-sm text-crm-text-muted">Gerenciar bairros por cidade</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            disabled={!selectedCityId}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA76A] hover:bg-[#C89659] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            Novo Bairro
          </button>
        </div>

        {/* Filtro por cidade */}
        <div className="bg-crm-bg-secondary rounded-lg border border-crm-border p-4">
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5 text-[#DDA76A]" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                Cidade
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full md:w-64 px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
              >
                <option value="">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name} - {city.state}
                  </option>
                ))}
              </select>
            </div>
            {selectedCity && (
              <div className="text-sm text-crm-text-muted">
                {neighborhoods.length} bairro(s) cadastrado(s)
              </div>
            )}
          </div>
        </div>

        {/* Lista */}
        {!selectedCityId ? (
          <div className="text-center py-12 bg-crm-bg-secondary rounded-lg border border-crm-border">
            <MapPin className="w-16 h-16 mx-auto text-crm-text-muted mb-4" />
            <p className="text-crm-text-muted">Selecione uma cidade para ver os bairros</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#DDA76A]" />
          </div>
        ) : neighborhoods.length === 0 ? (
          <div className="text-center py-12 bg-crm-bg-secondary rounded-lg border border-crm-border">
            <Building2 className="w-16 h-16 mx-auto text-crm-text-muted mb-4" />
            <p className="text-crm-text-muted">Nenhum bairro cadastrado para esta cidade</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-[#DDA76A] hover:underline"
            >
              Cadastrar primeiro bairro
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {neighborhoods.map((neighborhood) => (
              <div
                key={neighborhood.id}
                className={`bg-crm-bg-secondary rounded-lg border border-crm-border p-4 hover:bg-crm-bg-hover transition-colors ${
                  !neighborhood.active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#DDA76A]/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-[#DDA76A]" />
                    </div>
                    <h3 className="font-medium text-crm-text-primary">
                      {neighborhood.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(neighborhood)}
                      className="p-1.5 hover:bg-crm-bg-elevated rounded text-crm-text-muted hover:text-blue-400 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(neighborhood)}
                      className="p-1.5 hover:bg-crm-bg-elevated rounded text-crm-text-muted hover:text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end">
                  <button
                    onClick={() => handleToggleActive(neighborhood)}
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      neighborhood.active
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}
                  >
                    {neighborhood.active ? 'Ativo' : 'Inativo'}
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
                  {editingNeighborhood ? 'Editar Bairro' : 'Novo Bairro'}
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
                    Cidade *
                  </label>
                  <select
                    required
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  >
                    <option value="">Selecione...</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name} - {city.state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Nome do Bairro *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Centro"
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  />
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
