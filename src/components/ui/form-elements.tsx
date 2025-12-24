import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================
// ESTILOS BASE CENTRALIZADOS
// Altere aqui para aplicar em todo o sistema
// ============================================

export const formStyles = {
  // Input base
  input: `
    w-full px-4 py-3 
    bg-crm-bg-elevated 
    border border-crm-border 
    rounded-lg 
    text-crm-text-primary 
    placeholder:text-crm-text-muted 
    focus:outline-none focus:border-crm-accent focus:ring-1 focus:ring-crm-accent
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors
  `,
  
  // Input com erro
  inputError: `border-red-500 focus:border-red-500 focus:ring-red-500`,
  
  // Select base
  select: `
    w-full px-4 py-3 
    bg-crm-bg-elevated 
    border border-crm-border 
    rounded-lg 
    text-crm-text-primary 
    focus:outline-none focus:border-crm-accent focus:ring-1 focus:ring-crm-accent
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors
    cursor-pointer
  `,
  
  // Textarea base
  textarea: `
    w-full px-4 py-3 
    bg-crm-bg-elevated 
    border border-crm-border 
    rounded-lg 
    text-crm-text-primary 
    placeholder:text-crm-text-muted 
    focus:outline-none focus:border-crm-accent focus:ring-1 focus:ring-crm-accent
    disabled:opacity-50 disabled:cursor-not-allowed
    resize-none
    transition-colors
  `,
  
  // Label
  label: `block text-sm font-medium text-crm-text-secondary mb-2`,
  
  // Mensagem de erro
  errorMessage: `text-red-400 text-xs mt-1`,
  
  // Helper text
  helperText: `text-crm-text-muted text-xs mt-1`,
}

// ============================================
// COMPONENTES
// ============================================

// Input Props
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

// Input Component
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className={formStyles.label}>{label}</label>}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-crm-text-muted">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              formStyles.input,
              leftIcon && "pl-12",
              rightIcon && "pr-12",
              error && formStyles.inputError,
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-crm-text-muted">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className={formStyles.errorMessage}>{error}</p>}
        {helperText && !error && <p className={formStyles.helperText}>{helperText}</p>}
      </div>
    )
  }
)
FormInput.displayName = "FormInput"

// Select Props
export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: { value: string; label: string }[]
}

// Select Component
export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, label, error, helperText, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className={formStyles.label}>{label}</label>}
        <select
          ref={ref}
          className={cn(
            formStyles.select,
            error && formStyles.inputError,
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className={formStyles.errorMessage}>{error}</p>}
        {helperText && !error && <p className={formStyles.helperText}>{helperText}</p>}
      </div>
    )
  }
)
FormSelect.displayName = "FormSelect"

// Textarea Props
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

// Textarea Component
export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className={formStyles.label}>{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            formStyles.textarea,
            error && formStyles.inputError,
            className
          )}
          {...props}
        />
        {error && <p className={formStyles.errorMessage}>{error}</p>}
        {helperText && !error && <p className={formStyles.helperText}>{helperText}</p>}
      </div>
    )
  }
)
FormTextarea.displayName = "FormTextarea"

// ============================================
// UTILITÁRIOS DE CLASSE
// Para usar em casos onde não pode usar os componentes
// ============================================

export const getInputClassName = (hasError?: boolean, extra?: string) => 
  cn(formStyles.input, hasError && formStyles.inputError, extra)

export const getSelectClassName = (hasError?: boolean, extra?: string) => 
  cn(formStyles.select, hasError && formStyles.inputError, extra)

export const getTextareaClassName = (hasError?: boolean, extra?: string) => 
  cn(formStyles.textarea, hasError && formStyles.inputError, extra)
