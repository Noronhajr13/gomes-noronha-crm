'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { CRMLayout } from '@/components/layout'
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Save,
  ArrowLeft
} from 'lucide-react'

interface ComodidadesContentProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

interface Amenity {
  id: string
  name: string
  active: boolean
  order: number
  createdAt: string
}

export default function ComodidadesContent({ user }: ComodidadesContentProps) {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
  })

  const fetchAmenities = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/amenities?includeInactive=true')
      const data = await res.json()
      setAmenities(data.amenities || [])
    } catch (error) {
      console.error('Erro ao buscar comodidades:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAmenities()
  }, [fetchAmenities])

  const handleOpenModal = (amenity?: Amenity) => {
    if (amenity) {
      setEditingAmenity(amenity)
      setFormData({ name: amenity.name })
    } else {
      setEditingAmenity(null)
      setFormData({ name: '' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAmenity(null)
    setFormData({ name: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingAmenity
        ? `/api/amenities/${editingAmenity.id}`
        : '/api/amenities'
      const method = editingAmenity ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        handleCloseModal()
        fetchAmenities()
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao salvar comodidade')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar comodidade')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (amenity: Amenity) => {
    if (!confirm(`Deseja realmente excluir a comodidade "${amenity.name}"?`)) return

    try {
      const res = await fetch(`/api/amenities/${amenity.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchAmenities()
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao excluir comodidade')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir comodidade')
    }
  }

  const handleToggleActive = async (amenity: Amenity) => {
    try {
      await fetch(`/api/amenities/${amenity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !amenity.active }),
      })
      fetchAmenities()
    } catch (error) {
      console.error('Erro ao atualizar:', error)
    }
  }

  return (
    <CRMLayout title="Comodidades" user={user}>
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
              <h1 className="text-2xl font-bold text-crm-text-primary">Comodidades</h1>
              <p className="text-sm text-crm-text-muted">
                Gerenciar comodidades dos imóveis ({amenities.filter(a => a.active).length} ativas)
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA76A] hover:bg-[#C89659] text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            Nova Comodidade
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#DDA76A]" />
          </div>
        ) : amenities.length === 0 ? (
          <div className="text-center py-12 bg-crm-bg-secondary rounded-lg border border-crm-border">
            <Sparkles className="w-16 h-16 mx-auto text-crm-text-muted mb-4" />
            <p className="text-crm-text-muted">Nenhuma comodidade cadastrada</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-[#DDA76A] hover:underline"
            >
              Cadastrar primeira comodidade
            </button>
          </div>
        ) : (
          <div className="bg-crm-bg-secondary rounded-lg border border-crm-border p-6">
            <div className="flex flex-wrap gap-3">
              {amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    amenity.active
                      ? 'bg-crm-bg-primary border-crm-border hover:border-[#DDA76A]'
                      : 'bg-crm-bg-elevated border-crm-border opacity-60'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${amenity.active ? 'text-[#DDA76A]' : 'text-crm-text-muted'}`} />
                  <span className="text-crm-text-primary">{amenity.name}</span>

                  <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleActive(amenity)}
                      className={`p-1 rounded hover:bg-crm-bg-hover transition-colors ${
                        amenity.active ? 'text-green-400' : 'text-gray-400'
                      }`}
                      title={amenity.active ? 'Desativar' : 'Ativar'}
                    >
                      <div className={`w-3 h-3 rounded-full ${amenity.active ? 'bg-green-400' : 'bg-gray-400'}`} />
                    </button>
                    <button
                      onClick={() => handleOpenModal(amenity)}
                      className="p-1 rounded hover:bg-crm-bg-hover text-crm-text-muted hover:text-blue-400 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(amenity)}
                      className="p-1 rounded hover:bg-crm-bg-hover text-crm-text-muted hover:text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-crm-bg-secondary rounded-lg border border-crm-border w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-crm-border">
                <h2 className="text-xl font-semibold text-crm-text-primary">
                  {editingAmenity ? 'Editar Comodidade' : 'Nova Comodidade'}
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
                    Nome da Comodidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Piscina"
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
