'use client'

import { useState, useEffect, useCallback } from 'react'
import { CRMLayout } from '@/components/layout'
import {
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  X,
  Loader2,
  File,
  FileImage,
  FilePlus,
} from 'lucide-react'

interface DocumentsContentProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    role?: string
  }
}

interface Document {
  id: string
  title: string
  description?: string
  type: string
  category?: string
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  tags: string[]
  uploadedBy: { name: string }
  createdAt: string
  updatedAt: string
}

const documentTypes = [
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'PROPOSTA', label: 'Proposta' },
  { value: 'RG', label: 'RG' },
  { value: 'CPF', label: 'CPF' },
  { value: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de Residência' },
  { value: 'COMPROVANTE_RENDA', label: 'Comprovante de Renda' },
  { value: 'ESCRITURA', label: 'Escritura' },
  { value: 'IPTU', label: 'IPTU' },
  { value: 'MATRICULA', label: 'Matrícula' },
  { value: 'CERTIDAO', label: 'Certidão' },
  { value: 'LAUDO', label: 'Laudo' },
  { value: 'FOTO', label: 'Foto' },
  { value: 'OUTROS', label: 'Outros' },
]

export default function DocumentsContent({ user }: DocumentsContentProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [uploading, setUploading] = useState(false)

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'OUTROS',
    category: '',
    tags: '',
    file: null as File | null,
  })

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (typeFilter) params.append('type', typeFilter)

      const res = await fetch(`/api/documents?${params}`)
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.file) return

    setUploading(true)
    try {
      // Simular upload para Supabase (você pode integrar com o uploadPropertyImage)
      const fileUrl = URL.createObjectURL(uploadForm.file)

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.title,
          description: uploadForm.description,
          type: uploadForm.type,
          category: uploadForm.category,
          fileUrl,
          fileName: uploadForm.file.name,
          fileSize: uploadForm.file.size,
          mimeType: uploadForm.file.type,
          tags: uploadForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })

      if (res.ok) {
        setShowUploadModal(false)
        setUploadForm({
          title: '',
          description: '',
          type: 'OUTROS',
          category: '',
          tags: '',
          file: null,
        })
        fetchDocuments()
      }
    } catch (error) {
      console.error('Error uploading document:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este documento?')) return

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchDocuments()
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDocument) return

    try {
      const res = await fetch(`/api/documents/${selectedDocument.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedDocument.title,
          description: selectedDocument.description,
          type: selectedDocument.type,
          category: selectedDocument.category,
          tags: selectedDocument.tags,
        }),
      })

      if (res.ok) {
        setShowEditModal(false)
        setSelectedDocument(null)
        fetchDocuments()
      }
    } catch (error) {
      console.error('Error updating document:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  return (
    <CRMLayout title="Documentos" user={user}>
      <div className="space-y-6">
        {/* Header com Filtros */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-crm-text-muted" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-crm-bg-secondary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-crm-bg-secondary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
          >
            <option value="">Todos os Tipos</option>
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-[#DDA76A] hover:bg-[#C89659] text-white rounded-lg transition-colors"
          >
            <Upload size={18} />
            Upload
          </button>
        </div>

        {/* Lista de Documentos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#DDA76A]" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-crm-text-muted mb-4" />
            <p className="text-crm-text-muted">Nenhum documento encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-crm-bg-secondary border border-crm-border rounded-lg p-4 hover:bg-crm-bg-hover transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#DDA76A]/20 rounded-lg flex items-center justify-center text-[#DDA76A]">
                      {getFileIcon(doc.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-crm-text-primary truncate">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-crm-text-muted">{doc.fileName}</p>
                    </div>
                  </div>
                </div>

                {doc.description && (
                  <p className="text-sm text-crm-text-secondary mb-3 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                    {documentTypes.find((t) => t.value === doc.type)?.label}
                  </span>
                  <span className="text-xs text-crm-text-muted">
                    {formatFileSize(doc.fileSize)}
                  </span>
                </div>

                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doc.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs rounded bg-crm-bg-elevated text-crm-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-crm-border">
                  <div className="text-xs text-crm-text-muted">
                    <div>{doc.uploadedBy.name}</div>
                    <div>{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                      className="p-1.5 hover:bg-crm-bg-elevated rounded text-crm-text-muted hover:text-[#DDA76A] transition-colors"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDocument(doc)
                        setShowEditModal(true)
                      }}
                      className="p-1.5 hover:bg-crm-bg-elevated rounded text-crm-text-muted hover:text-blue-400 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 hover:bg-crm-bg-elevated rounded text-crm-text-muted hover:text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Upload */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-crm-bg-secondary rounded-lg border border-crm-border w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-crm-border">
                <h2 className="text-xl font-semibold text-crm-text-primary">
                  Upload de Documento
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-crm-bg-hover rounded-lg transition-colors"
                >
                  <X size={20} className="text-crm-text-muted" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                      Tipo *
                    </label>
                    <select
                      required
                      value={uploadForm.type}
                      onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                      className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                    >
                      {documentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={uploadForm.category}
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, category: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    placeholder="imóvel, contrato, cliente"
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Arquivo *
                  </label>
                  <input
                    type="file"
                    required
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })
                    }
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 border border-crm-border rounded-lg text-crm-text-primary hover:bg-crm-bg-hover transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-[#DDA76A] hover:bg-[#C89659] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Upload'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {showEditModal && selectedDocument && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-crm-bg-secondary rounded-lg border border-crm-border w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-crm-border">
                <h2 className="text-xl font-semibold text-crm-text-primary">
                  Editar Documento
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedDocument(null)
                  }}
                  className="p-2 hover:bg-crm-bg-hover rounded-lg transition-colors"
                >
                  <X size={20} className="text-crm-text-muted" />
                </button>
              </div>

              <form onSubmit={handleEdit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedDocument.title}
                    onChange={(e) =>
                      setSelectedDocument({ ...selectedDocument, title: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={selectedDocument.description || ''}
                    onChange={(e) =>
                      setSelectedDocument({ ...selectedDocument, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                    Tipo *
                  </label>
                  <select
                    required
                    value={selectedDocument.type}
                    onChange={(e) =>
                      setSelectedDocument({ ...selectedDocument, type: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-crm-text-primary focus:outline-none focus:ring-2 focus:ring-[#DDA76A]"
                  >
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedDocument(null)
                    }}
                    className="flex-1 px-4 py-2 border border-crm-border rounded-lg text-crm-text-primary hover:bg-crm-bg-hover transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#DDA76A] hover:bg-[#C89659] text-white rounded-lg transition-colors"
                  >
                    Salvar
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
