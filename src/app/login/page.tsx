'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Building2 } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(error ? 'Credenciais inválidas' : null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl
      })

      if (result?.error) {
        setLoginError('Email ou senha incorretos')
        setIsLoading(false)
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setLoginError('Erro ao fazer login. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Logo */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-crm-accent rounded-lg flex items-center justify-center">
            <Building2 className="w-7 h-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-crm-text-primary">
          Gomes & Noronha
        </h1>
        <p className="mt-2 text-crm-text-muted">
          Sistema de Gestão Imobiliária
        </p>
      </div>

      {/* Error Message */}
      {loginError && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400">{loginError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-crm-text-secondary mb-2">
            E-mail
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="w-5 h-5 text-crm-text-muted" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="crm-input pl-10"
              placeholder="seu@email.com"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-crm-text-secondary mb-2">
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="w-5 h-5 text-crm-text-muted" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="crm-input pl-10 pr-10"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-crm-text-muted hover:text-crm-text-secondary transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="crm-button-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Entrando...</span>
            </>
          ) : (
            <>
              <span>Entrar</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-crm-text-muted">
        Problemas para acessar?{' '}
        <a
          href="https://wa.me/5532987084750"
          target="_blank"
          rel="noopener noreferrer"
          className="text-crm-accent-blue hover:underline"
        >
          Fale conosco
        </a>
      </p>
    </div>
  )
}

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-crm-accent rounded-lg flex items-center justify-center">
            <Building2 className="w-7 h-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-crm-text-primary">
          Gomes & Noronha
        </h1>
        <p className="mt-2 text-crm-text-muted">
          Sistema de Gestão Imobiliária
        </p>
      </div>
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-crm-text-muted/20 border-t-crm-accent rounded-full animate-spin" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-crm-bg-primary">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Right Side - Info */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-crm-bg-secondary p-12">
        <div className="max-w-md space-y-8">
          <div>
            <span className="crm-badge crm-badge-success">
              CRM Imobiliário
            </span>
            <h2 className="mt-4 text-2xl font-bold text-crm-text-primary">
              Gerencie seu negócio imobiliário
            </h2>
            <p className="mt-2 text-crm-text-muted">
              Tenha controle total sobre seus imóveis, leads e vendas em um único lugar.
            </p>
          </div>

          <div className="space-y-4">
            {[
              'Gestão completa de imóveis',
              'Pipeline de vendas visual',
              'Controle de leads e clientes',
              'Relatórios e analytics',
              'Automação de tarefas'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-crm-accent rounded-full" />
                <span className="text-crm-text-secondary">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-crm-border">
            <p className="text-sm text-crm-text-muted">
              CRECI PJ 9297 • Juiz de Fora - MG
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
