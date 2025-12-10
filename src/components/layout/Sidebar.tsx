'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Home,
  Building2,
  Users,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Headphones,
  FileText,
  X
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
  isOpen?: boolean
  onClose?: () => void
}

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Building2, label: 'Imóveis', href: '/imoveis' },
  { icon: Headphones, label: 'Atendimentos', href: '/atendimentos' },
  { icon: Users, label: 'Leads', href: '/leads' },
  { icon: Calendar, label: 'Tarefas', href: '/tarefas' },
  { icon: BarChart3, label: 'Relatórios', href: '/relatorios' },
  { icon: FileText, label: 'Documentos', href: '/documentos' },
]

const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'ADMIN': return 'Administrador'
    case 'BROKER': return 'Corretor'
    case 'DISPATCHER': return 'Despachante'
    default: return 'Usuário'
  }
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-crm-bg-secondary border-r border-crm-border z-40 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} hidden lg:block`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-crm-border">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#DDA76A] rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-[#DDA76A]">G&N</span>
                <span className="text-xs text-crm-text-muted ml-1">CRM</span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto">
              <div className="w-8 h-8 bg-[#DDA76A] rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-crm-bg-hover text-crm-text-muted"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#DDA76A] text-white'
                    : 'text-crm-text-muted hover:bg-crm-bg-hover hover:text-crm-text-primary'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-crm-border bg-crm-bg-secondary">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#DDA76A]/20 flex items-center justify-center">
                  <span className="text-[#DDA76A] font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-crm-text-primary truncate">{user.name || 'Usuário'}</p>
                  <p className="text-xs text-crm-text-muted">{getRoleLabel(user.role)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/configuracoes"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-crm-text-muted hover:bg-crm-bg-hover hover:text-crm-text-primary rounded-lg transition-colors"
                >
                  <Settings size={16} />
                  Config
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center justify-center px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center justify-center p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-crm-bg-secondary border-r border-crm-border z-50 transform transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-crm-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#DDA76A] rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-[#DDA76A]">G&N</span>
              <span className="text-xs text-crm-text-muted ml-1">CRM</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-crm-bg-hover text-crm-text-muted"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#DDA76A] text-white'
                    : 'text-crm-text-muted hover:bg-crm-bg-hover hover:text-crm-text-primary'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-crm-border bg-crm-bg-secondary">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#DDA76A]/20 flex items-center justify-center">
                <span className="text-[#DDA76A] font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-crm-text-primary truncate">{user.name || 'Usuário'}</p>
                <p className="text-xs text-crm-text-muted">{getRoleLabel(user.role)}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
