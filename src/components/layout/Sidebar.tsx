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
  FileText
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
    role: string
  }
}

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Imóveis', href: '/imoveis', icon: Building2 },
  { name: 'Atendimentos', href: '/atendimentos', icon: Headphones },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Tarefas', href: '/tarefas', icon: Calendar },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Documentos', href: '/documentos', icon: FileText },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-crm-bg-secondary border-r border-crm-border flex flex-col transition-all duration-300 z-40",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-crm-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-crm-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-crm-text-primary text-sm">Gomes & Noronha</span>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 bg-crm-accent rounded-lg flex items-center justify-center mx-auto">
            <Home className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-crm-accent text-white"
                    : "text-crm-text-muted hover:bg-crm-bg-hover hover:text-crm-text-primary",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-crm-border p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-crm-bg-hover flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-crm-text-primary">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-crm-text-primary truncate">{user.name}</p>
              <p className="text-xs text-crm-text-muted truncate">{user.role}</p>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/configuracoes"
                className="p-1.5 text-crm-text-muted hover:text-crm-text-primary hover:bg-crm-bg-hover rounded transition-colors"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-1.5 text-crm-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-crm-bg-hover flex items-center justify-center">
              <span className="text-sm font-medium text-crm-text-primary">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-1.5 text-crm-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-crm-bg-elevated border border-crm-border rounded-full flex items-center justify-center text-crm-text-muted hover:text-crm-text-primary transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  )
}
