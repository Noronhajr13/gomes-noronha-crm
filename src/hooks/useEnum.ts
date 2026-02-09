'use client'

import { useState, useEffect } from 'react'
import { enumLabels, enumColors, enumColorsDark, getEnumLabel, getEnumColor } from '@/lib/enum-labels'

type EnumOption = { value: string; label: string }

// Cache module-level para evitar re-fetch entre componentes
const cache = new Map<string, string[]>()
const pending = new Map<string, Promise<string[]>>()

async function fetchEnum(enumName: string): Promise<string[]> {
  if (cache.has(enumName)) {
    return cache.get(enumName)!
  }

  if (pending.has(enumName)) {
    return pending.get(enumName)!
  }

  const promise = fetch(`/api/enums/${enumName}`)
    .then(res => {
      if (!res.ok) throw new Error(`Erro ao buscar enum ${enumName}`)
      return res.json()
    })
    .then(data => {
      const values = data.values as string[]
      cache.set(enumName, values)
      pending.delete(enumName)
      return values
    })
    .catch(err => {
      pending.delete(enumName)
      // Fallback: usar as keys do enumLabels se a API falhar
      const fallback = Object.keys(enumLabels[enumName] || {})
      if (fallback.length > 0) {
        cache.set(enumName, fallback)
        return fallback
      }
      throw err
    })

  pending.set(enumName, promise)
  return promise
}

export function useEnum(enumName: string, opts?: {
  addAllOption?: boolean
  allOptionLabel?: string
}) {
  const [values, setValues] = useState<string[]>(() => cache.get(enumName) || [])
  const [loading, setLoading] = useState(!cache.has(enumName))

  useEffect(() => {
    if (cache.has(enumName)) {
      setValues(cache.get(enumName)!)
      setLoading(false)
      return
    }

    let cancelled = false
    fetchEnum(enumName).then(vals => {
      if (!cancelled) {
        setValues(vals)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [enumName])

  const options: EnumOption[] = values.map(v => ({
    value: v,
    label: getEnumLabel(enumName, v),
  }))

  if (opts?.addAllOption) {
    options.unshift({ value: '', label: opts.allOptionLabel || 'Todos' })
  }

  return {
    options,
    values,
    loading,
    getLabel: (value: string) => getEnumLabel(enumName, value),
    getColor: (value: string, variant: 'light' | 'dark' = 'light') => getEnumColor(enumName, value, variant),
  }
}
