'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  FunnelIcon,
  PhoneIcon,
  HomeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  UserIcon,
  TrashIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import CRMLayout from '@/components/layout/CRMLayout'
import { formStyles, getInputClassName, getSelectClassName } from '@/components/ui/form-elements'

interface Task {
  id: string
  title: string
  description: string | null
  dueDate: Date | null
  priority: string
  completed: boolean
  leadId: string | null
  createdAt: Date
  updatedAt: Date
  userId: string
  user: {
    id: string
    name: string | null
    email: string | null
  }
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
  tasks: Task[]
  users: UserOption[]
  user: User
}

const priorityLabels: Record<string, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
}

const priorityColors: Record<string, string> = {
  BAIXA: 'bg-crm-bg-hover text-crm-text-secondary',
  MEDIA: 'bg-blue-100 text-blue-700',
  ALTA: 'bg-orange-100 text-orange-700',
  URGENTE: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
}

const statusColors: Record<string, string> = {
  PENDENTE: 'bg-amber-100 text-amber-700',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
  CONCLUIDA: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-crm-bg-hover text-crm-text-muted',
}

const typeLabels: Record<string, string> = {
  GERAL: 'Geral',
  LIGACAO: 'Ligação',
  VISITA: 'Visita',
  DOCUMENTACAO: 'Documentação',
  CONTRATO: 'Contrato',
  FINANCEIRO: 'Financeiro',
  FOLLOW_UP: 'Follow-up',
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  GERAL: DocumentTextIcon,
  LIGACAO: PhoneIcon,
  VISITA: HomeIcon,
  DOCUMENTACAO: DocumentTextIcon,
  CONTRATO: DocumentTextIcon,
  FINANCEIRO: CurrencyDollarIcon,
  FOLLOW_UP: ArrowPathIcon,
}

export default function TasksListContent({ tasks: initialTasks, users, user }: Props) {
  const router = useRouter()
  const [tasks, setTasks] = useState(initialTasks)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIA',
    userId: user.id || '',
  })

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('pt-BR')
  }

  const isOverdue = (dueDate: Date | null, completed: boolean) => {
    if (!dueDate || completed) return false
    return new Date(dueDate) < new Date()
  }

  const getDaysUntilDue = (dueDate: Date | null) => {
    if (!dueDate) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || (statusFilter === 'CONCLUIDA' ? task.completed : !task.completed)
    const matchesPriority = !priorityFilter || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Estatísticas
  const stats = {
    total: tasks.length,
    pendentes: tasks.filter(t => !t.completed).length,
    concluidas: tasks.filter(t => t.completed).length,
    atrasadas: tasks.filter(t => isOverdue(t.dueDate, t.completed)).length,
  }

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      alert('Título é obrigatório')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
        }),
      })

      if (response.ok) {
        const task = await response.json()
        setTasks([task, ...tasks])
        setShowNewTaskModal(false)
        setNewTask({
          title: '',
          description: '',
          dueDate: '',
          priority: 'MEDIA',
          userId: user.id || '',
        })
      } else {
        alert('Erro ao criar tarefa')
      }
    } catch (error) {
      alert('Erro ao criar tarefa')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleComplete = async (taskId: string, currentCompleted: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          completed: !currentCompleted
        }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(tasks.map(t => t.id === taskId ? updatedTask : t))
      }
    } catch (error) {
      alert('Erro ao atualizar tarefa')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== taskId))
      }
    } catch (error) {
      alert('Erro ao excluir tarefa')
    }
  }

  const TaskIcon = ({ type }: { type: string }) => {
    const Icon = typeIcons[type] || DocumentTextIcon
    return <Icon className="w-5 h-5" />
  }

  return (
    <CRMLayout user={user} title="Tarefas">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
            <p className="text-sm text-crm-text-muted mt-1">
              Gerencie suas tarefas e atividades
            </p>
          </div>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
          >
            <PlusIcon className="w-5 h-5" />
            Nova Tarefa
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-crm-bg-surface rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-crm-bg-hover rounded-lg">
                <DocumentTextIcon className="w-5 h-5 text-crm-text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-crm-text-muted">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-crm-bg-surface rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <ClockIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.pendentes}</p>
                <p className="text-xs text-crm-text-muted">Pendentes</p>
              </div>
            </div>
          </div>
          <div className="bg-crm-bg-surface rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
                <p className="text-xs text-crm-text-muted">Concluídas</p>
              </div>
            </div>
          </div>
          <div className="bg-crm-bg-surface rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.atrasadas}</p>
                <p className="text-xs text-crm-text-muted">Atrasadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-crm-bg-surface rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-crm-text-muted" />
                <input
                  type="text"
                  placeholder="Buscar tarefas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-crm-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={formStyles.input}
            >
              <option value="">Todos os Status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={formStyles.input}
            >
              <option value="">Todas as Prioridades</option>
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-crm-bg-surface rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <DocumentTextIcon className="w-12 h-12 text-crm-text-disabled mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma tarefa encontrada
              </h3>
              <p className="text-crm-text-muted mb-4">
                {search || statusFilter || priorityFilter
                  ? 'Tente ajustar os filtros'
                  : 'Crie sua primeira tarefa para começar'}
              </p>
              <button
                onClick={() => setShowNewTaskModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                <PlusIcon className="w-5 h-5" />
                Nova Tarefa
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const daysUntil = getDaysUntilDue(task.dueDate)
              const overdue = isOverdue(task.dueDate, task.completed)

              return (
                <div
                  key={task.id}
                  className={`bg-crm-bg-surface rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow ${
                    task.completed ? 'opacity-60' : ''
                  } ${overdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox / Complete Button */}
                    <button
                      onClick={() => handleToggleComplete(task.id, task.completed)}
                      className={`mt-1 flex-shrink-0 ${
                        task.completed
                          ? 'text-green-500'
                          : 'text-crm-text-disabled hover:text-green-500'
                      }`}
                    >
                      {task.completed ? (
                        <CheckCircleSolid className="w-6 h-6" />
                      ) : (
                        <CheckCircleIcon className="w-6 h-6" />
                      )}
                    </button>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-medium ${
                            task.completed 
                              ? 'text-crm-text-muted line-through' 
                              : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-crm-text-muted mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-crm-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {/* Due Date */}
                        {task.dueDate && (
                          <div className={`flex items-center gap-1 text-sm ${
                            overdue ? 'text-red-600 font-medium' : 'text-crm-text-muted'
                          }`}>
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              {formatDate(task.dueDate)}
                              {daysUntil !== null && (
                                <span className="ml-1">
                                  {overdue 
                                    ? `(${Math.abs(daysUntil)} dias atrás)` 
                                    : daysUntil === 0 
                                      ? '(Hoje)'
                                      : daysUntil === 1
                                        ? '(Amanhã)'
                                        : `(em ${daysUntil} dias)`
                                  }
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Assignee */}
                        <div className="flex items-center gap-1 text-sm text-crm-text-muted">
                          <UserIcon className="w-4 h-4" />
                          <span>{task.user?.name || 'Sem responsável'}</span>
                        </div>

                        {/* Priority Badge */}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                          {priorityLabels[task.priority]}
                        </span>

                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${task.completed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {task.completed ? 'Concluída' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-crm-bg-surface rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Nova Tarefa</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className={formStyles.input}
                    placeholder="Ex: Ligar para cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                    className={formStyles.input}
                    placeholder="Detalhes da tarefa..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                      Data de Vencimento
                    </label>
                    <input
                      type="datetime-local"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className={formStyles.input}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                      Prioridade
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className={formStyles.input}
                    >
                      {Object.entries(priorityLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                    Responsável
                  </label>
                  <select
                    value={newTask.userId}
                    onChange={(e) => setNewTask({ ...newTask, userId: e.target.value })}
                    className={formStyles.input}
                  >
                    <option value="">Selecione...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 text-crm-text-secondary bg-crm-bg-hover rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={saving}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Criar Tarefa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  )
}
