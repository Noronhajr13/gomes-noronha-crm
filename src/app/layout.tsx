import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'CRM - Gomes & Noronha',
    template: '%s | CRM Gomes & Noronha'
  },
  description: 'Sistema de gestão imobiliária Gomes & Noronha',
  robots: {
    index: false,
    follow: false
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
