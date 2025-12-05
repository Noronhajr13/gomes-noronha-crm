'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { useState } from 'react'

interface TopBarProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
}

export default function TopBar({ title, subtitle, onMenuClick }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="h-16 bg-crm-bg-secondary border-b border-crm-border flex items-center justify-between px-6">
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
        <div className="relative">
          {searchOpen ? (
            <input
              type="text"
              placeholder="Buscar..."
              className="w-64 px-4 py-2 bg-crm-bg-primary border border-crm-border rounded-lg text-sm text-crm-text-primary placeholder:text-crm-text-muted focus:outline-none focus:border-crm-accent"
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
      </div>
    </header>
  )
}
