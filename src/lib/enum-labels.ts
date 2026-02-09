// Mapeamento centralizado de labels para enums do Prisma
export const enumLabels: Record<string, Record<string, string>> = {
  PropertyType: {
    CASA: 'Casa',
    APARTAMENTO: 'Apartamento',
    COBERTURA: 'Cobertura',
    KITNET: 'Kitnet',
    FLAT: 'Flat',
    SOBRADO: 'Sobrado',
    TERRENO: 'Terreno',
    COMERCIAL: 'Comercial',
    SALA_COMERCIAL: 'Sala Comercial',
    LOJA: 'Loja',
    GALPAO: 'Galpão',
    RURAL: 'Rural',
    SITIO: 'Sítio',
    FAZENDA: 'Fazenda',
  },
  PropertyPurpose: {
    VENDA: 'Venda',
    ALUGUEL: 'Aluguel',
    VENDA_ALUGUEL: 'Venda/Aluguel',
  },
  PropertyStatus: {
    DISPONIVEL: 'Disponível',
    RESERVADO: 'Reservado',
    VENDIDO: 'Vendido',
    ALUGADO: 'Alugado',
    INATIVO: 'Inativo',
  },
  LeadSource: {
    SITE: 'Site',
    TELEFONE: 'Telefone',
    INDICACAO: 'Indicação',
    FACEBOOK: 'Facebook',
    INSTAGRAM: 'Instagram',
    WHATSAPP: 'WhatsApp',
    PORTAIS: 'Portais',
    PORTAL_ZAP: 'Portal Zap',
    PORTAL_VIVAREAL: 'Viva Real',
    PORTAL_OLX: 'OLX',
    REDES_SOCIAIS: 'Redes Sociais',
    VISITA_ESCRITORIO: 'Visita Escritório',
    OUTRO: 'Outro',
  },
  LeadStatus: {
    NOVO: 'Novo',
    CONTATO_REALIZADO: 'Contato Realizado',
    QUALIFICADO: 'Qualificado',
    VISITA_AGENDADA: 'Visita Agendada',
    PROPOSTA_ENVIADA: 'Proposta Enviada',
    NEGOCIACAO: 'Em Negociação',
    FECHADO_GANHO: 'Fechado (Ganho)',
    FECHADO_PERDIDO: 'Fechado (Perdido)',
  },
  TaskStatus: {
    PENDENTE: 'Pendente',
    EM_ANDAMENTO: 'Em Andamento',
    CONCLUIDA: 'Concluída',
    CANCELADA: 'Cancelada',
  },
  TaskType: {
    GERAL: 'Geral',
    LIGACAO: 'Ligação',
    VISITA: 'Visita',
    DOCUMENTACAO: 'Documentação',
    CONTRATO: 'Contrato',
    FINANCEIRO: 'Financeiro',
    FOLLOW_UP: 'Follow-up',
  },
  TaskPriority: {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    URGENTE: 'Urgente',
  },
  DocumentType: {
    CONTRATO: 'Contrato',
    PROPOSTA: 'Proposta',
    RG: 'RG',
    CPF: 'CPF',
    COMPROVANTE_RESIDENCIA: 'Comprovante de Residência',
    COMPROVANTE_RENDA: 'Comprovante de Renda',
    ESCRITURA: 'Escritura',
    IPTU: 'IPTU',
    MATRICULA: 'Matrícula',
    CERTIDAO: 'Certidão',
    LAUDO: 'Laudo',
    FOTO: 'Foto',
    OUTROS: 'Outros',
  },
  ActivityType: {
    LEAD_CRIADO: 'Lead Criado',
    LEAD_ATUALIZADO: 'Lead Atualizado',
    LEAD_STATUS_ALTERADO: 'Status Alterado',
    CONTATO_REALIZADO: 'Contato Realizado',
    VISITA_AGENDADA: 'Visita Agendada',
    VISITA_REALIZADA: 'Visita Realizada',
    PROPOSTA_ENVIADA: 'Proposta Enviada',
    NEGOCIACAO_INICIADA: 'Negociação Iniciada',
    VENDA_REALIZADA: 'Venda Realizada',
    COMENTARIO_ADICIONADO: 'Comentário Adicionado',
  },
  VisitStatus: {
    AGENDADA: 'Agendada',
    CONFIRMADA: 'Confirmada',
    REALIZADA: 'Realizada',
    CANCELADA: 'Cancelada',
    REMARCADA: 'Remarcada',
    NAO_COMPARECEU: 'Não Compareceu',
  },
}

// Cores padrão para badges (estilo light: bg-*-100 text-*-800)
export const enumColors: Record<string, Record<string, string>> = {
  PropertyStatus: {
    DISPONIVEL: 'bg-green-100 text-green-800',
    RESERVADO: 'bg-yellow-100 text-yellow-800',
    VENDIDO: 'bg-blue-100 text-blue-800',
    ALUGADO: 'bg-purple-100 text-purple-800',
    INATIVO: 'bg-crm-bg-hover text-crm-text-primary',
  },
  LeadStatus: {
    NOVO: 'bg-blue-100 text-blue-800',
    CONTATO_REALIZADO: 'bg-cyan-100 text-cyan-800',
    QUALIFICADO: 'bg-purple-100 text-purple-800',
    VISITA_AGENDADA: 'bg-amber-100 text-amber-800',
    PROPOSTA_ENVIADA: 'bg-orange-100 text-orange-800',
    NEGOCIACAO: 'bg-indigo-100 text-indigo-800',
    FECHADO_GANHO: 'bg-green-100 text-green-800',
    FECHADO_PERDIDO: 'bg-red-100 text-red-800',
  },
  TaskStatus: {
    PENDENTE: 'bg-amber-100 text-amber-700',
    EM_ANDAMENTO: 'bg-blue-100 text-blue-700',
    CONCLUIDA: 'bg-green-100 text-green-700',
    CANCELADA: 'bg-crm-bg-hover text-crm-text-muted',
  },
  TaskPriority: {
    BAIXA: 'bg-crm-bg-hover text-crm-text-secondary',
    MEDIA: 'bg-blue-100 text-blue-700',
    ALTA: 'bg-orange-100 text-orange-700',
    URGENTE: 'bg-red-100 text-red-700',
  },
  VisitStatus: {
    AGENDADA: 'bg-blue-100 text-blue-800',
    CONFIRMADA: 'bg-green-100 text-green-800',
    REALIZADA: 'bg-emerald-100 text-emerald-800',
    CANCELADA: 'bg-red-100 text-red-800',
    REMARCADA: 'bg-amber-100 text-amber-800',
    NAO_COMPARECEU: 'bg-crm-bg-hover text-crm-text-primary',
  },
}

// Cores para contexto dashboard/listagem (estilo dark: bg-*-500/20 text-*-400)
export const enumColorsDark: Record<string, Record<string, string>> = {
  PropertyStatus: {
    DISPONIVEL: 'bg-green-500/20 text-green-400',
    RESERVADO: 'bg-yellow-500/20 text-yellow-400',
    VENDIDO: 'bg-blue-500/20 text-blue-400',
    ALUGADO: 'bg-purple-500/20 text-purple-400',
    INATIVO: 'bg-crm-bg-elevated0/20 text-crm-text-muted',
  },
  LeadStatus: {
    NOVO: 'bg-blue-500/20 text-blue-400',
    CONTATO_REALIZADO: 'bg-cyan-500/20 text-cyan-400',
    QUALIFICADO: 'bg-purple-500/20 text-purple-400',
    VISITA_AGENDADA: 'bg-amber-500/20 text-amber-400',
    PROPOSTA_ENVIADA: 'bg-orange-500/20 text-orange-400',
    NEGOCIACAO: 'bg-indigo-500/20 text-indigo-400',
    FECHADO_GANHO: 'bg-green-500/20 text-green-400',
    FECHADO_PERDIDO: 'bg-red-500/20 text-red-400',
  },
  TaskPriority: {
    URGENTE: 'bg-red-500',
    ALTA: 'bg-red-400',
    MEDIA: 'bg-yellow-400',
    BAIXA: 'bg-gray-400',
  },
}

// Cores solidas para indicadores (ex: kanban column headers)
export const enumColorsKanban: Record<string, string> = {
  NOVO: 'bg-blue-500',
  CONTATO_REALIZADO: 'bg-cyan-500',
  QUALIFICADO: 'bg-purple-500',
  VISITA_AGENDADA: 'bg-amber-500',
  PROPOSTA_ENVIADA: 'bg-orange-500',
  NEGOCIACAO: 'bg-indigo-500',
  FECHADO_GANHO: 'bg-green-500',
  FECHADO_PERDIDO: 'bg-red-500',
}

// Labels curtos para kanban
export const enumLabelsKanban: Record<string, string> = {
  NOVO: 'Novos',
  CONTATO_REALIZADO: 'Contato Realizado',
  QUALIFICADO: 'Qualificados',
  VISITA_AGENDADA: 'Visita Agendada',
  PROPOSTA_ENVIADA: 'Proposta Enviada',
  NEGOCIACAO: 'Em Negociação',
  FECHADO_GANHO: 'Ganhos',
  FECHADO_PERDIDO: 'Perdidos',
}

export function getEnumLabel(enumName: string, value: string): string {
  return enumLabels[enumName]?.[value] || value
}

export function getEnumColor(enumName: string, value: string, variant: 'light' | 'dark' = 'light'): string {
  const colorMap = variant === 'dark' ? enumColorsDark : enumColors
  return colorMap[enumName]?.[value] || 'bg-crm-bg-hover text-crm-text-primary'
}
