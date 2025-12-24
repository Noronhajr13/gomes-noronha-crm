'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { useState } from 'react'
import { formStyles } from '@/components/ui/form-elements'

interface TopBarProps {
  title: string
  subtitle?: string
  user?: {
    name?: string | null
    email?: string | null
    role?: string
  }
  onMenuClick?: () => void
}

export default function TopBar({ title, subtitle, user, onMenuClick }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="h-16 bg-crm-bg-secondary border-b border-crm-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-crm-text-muted hover:text-crm-text-primary hover:bg-crm-bg-hover rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-crm-text-primary">{title}</h1>
          {subtitle && <p className="text-sm text-crm-text-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          {searchOpen ? (
            <input
              type="text"
              placeholder="Buscar..."
              className={`w-64 text-sm ${formStyles.input}`}
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-crm-text-muted hover:text-crm-text-primary hover:bg-crm-bg-hover rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <button className="p-2 text-crm-text-muted hover:text-crm-text-primary hover:bg-crm-bg-hover rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Info (mobile hidden) */}
        {user && (
          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-crm-border">
            <div className="text-right">
              <p className="text-sm font-medium text-crm-text-primary">{user.name}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#DDA76A]/20 flex items-center justify-center">
              <span className="text-[#DDA76A] font-semibold text-sm">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
