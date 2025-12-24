# Componentes UI Padronizados - CRM Gomes & Noronha

## 📦 Arquivos

- `form-elements.tsx` - Estilos e componentes de formulário
- `button.tsx` - Botões
- `card.tsx` - Cards
- `input.tsx` - Input básico (shadcn)

## 🎨 Como Usar

### Opção 1: Usar os estilos diretamente

```tsx
import { formStyles } from '@/components/ui/form-elements'

<input className={formStyles.input} />
<select className={formStyles.select} />
<textarea className={formStyles.textarea} />
<label className={formStyles.label}>Label</label>
```

### Opção 2: Usar funções com suporte a erro

```tsx
import { getInputClassName, getSelectClassName } from '@/components/ui/form-elements'

<input className={getInputClassName(hasError)} />
<input className={getInputClassName(hasError, 'extra-class')} />
```

### Opção 3: Usar componentes completos

```tsx
import { FormInput, FormSelect, FormTextarea } from '@/components/ui/form-elements'

<FormInput 
  label="Nome"
  error={errors.name}
  placeholder="Digite o nome"
/>

<FormSelect 
  label="Tipo"
  options={[
    { value: 'casa', label: 'Casa' },
    { value: 'apto', label: 'Apartamento' }
  ]}
/>
```

## 🔧 Personalização

Para alterar o estilo de TODOS os inputs do sistema, edite o objeto `formStyles` em `form-elements.tsx`:

```tsx
export const formStyles = {
  input: `
    w-full px-4 py-3 
    bg-crm-bg-elevated       // Cor de fundo
    border border-crm-border // Borda
    rounded-lg               // Bordas arredondadas
    text-crm-text-primary    // Cor do texto
    ...
  `,
}
```

## 🎯 Cores do Tema CRM

As cores estão definidas em `tailwind.config.ts`:

- `crm-bg-primary` - Fundo principal (#0B0F14)
- `crm-bg-elevated` - Fundo elevado (#151B23)
- `crm-bg-surface` - Superfície (#1C2432)
- `crm-border` - Bordas (#2D3748)
- `crm-text-primary` - Texto principal (#F7FAFC)
- `crm-text-secondary` - Texto secundário (#A0AEC0)
- `crm-text-muted` - Texto suave (#718096)
- `crm-accent` - Cor de destaque (#DDA76A)
