'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { cn } from '@/lib/utils'

interface CRMLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  user: {
    name?: string | null
    email?: string | null
    role: string
  }
}

export default function CRMLayout({ children, title, subtitle, user }: CRMLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-crm-bg-primary">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="lg:pl-64 transition-all duration-300">
        <TopBar 
          title={title} 
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
