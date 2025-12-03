import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Criar usuário admin
  const adminPassword = await hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gomesnoronha.com.br' },
    update: {},
    create: {
      email: 'admin@gomesnoronha.com.br',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
      phone: '32987084750',
      active: true
    }
  })
  console.log('✅ Usuário admin criado:', admin.email)

  // Criar corretor Wesley
  const wesleyPassword = await hash('wesley123', 12)
  
  const wesley = await prisma.user.upsert({
    where: { email: 'wesley@gomesnoronha.com.br' },
    update: {},
    create: {
      email: 'wesley@gomesnoronha.com.br',
      name: 'Wesley Gomes',
      password: wesleyPassword,
      role: 'CORRETOR',
      phone: '32987084750',
      creci: '12345',
      active: true
    }
  })
  console.log('✅ Corretor Wesley criado:', wesley.email)

  // Criar despachante Claudio
  const claudioPassword = await hash('claudio123', 12)
  
  const claudio = await prisma.user.upsert({
    where: { email: 'claudio@gomesnoronha.com.br' },
    update: {},
    create: {
      email: 'claudio@gomesnoronha.com.br',
      name: 'Claudio Noronha',
      password: claudioPassword,
      role: 'DESPACHANTE',
      phone: '32988451817',
      active: true
    }
  })
  console.log('✅ Despachante Claudio criado:', claudio.email)

  // Criar imóveis de exemplo
  const properties = [
    {
      code: 'AP001',
      title: 'Apartamento de Luxo no Centro',
      description: 'Apartamento de alto padrão no coração de Juiz de Fora, com acabamento de primeira qualidade e vista privilegiada.',
      type: 'APARTAMENTO' as const,
      transactionType: 'VENDA' as const,
      status: 'DISPONIVEL' as const,
      price: 650000,
      area: 120,
      bedrooms: 3,
      bathrooms: 2,
      suites: 1,
      parking: 2,
      address: 'Rua Halfeld',
      addressNumber: '890',
      neighborhood: 'Centro',
      city: 'Juiz de Fora',
      state: 'MG',
      zipCode: '36010-000',
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'],
      amenities: ['Piscina', 'Academia', 'Churrasqueira', 'Salão de Festas', 'Portaria 24h'],
      featured: true,
      exclusive: true,
      condominiumFee: 850,
      iptu: 450,
      yearBuilt: 2022,
      userId: wesley.id
    },
    {
      code: 'CA002',
      title: 'Casa em Condomínio São Mateus',
      description: 'Casa moderna em condomínio fechado com total segurança e lazer completo.',
      type: 'CASA' as const,
      transactionType: 'VENDA' as const,
      status: 'DISPONIVEL' as const,
      price: 890000,
      area: 250,
      bedrooms: 4,
      bathrooms: 3,
      suites: 2,
      parking: 3,
      address: 'Condomínio Solar dos Lagos',
      neighborhood: 'São Mateus',
      city: 'Juiz de Fora',
      state: 'MG',
      images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop'],
      amenities: ['Área Gourmet', 'Piscina Privativa', 'Jardim', 'Suíte Master', 'Closet'],
      featured: true,
      exclusive: false,
      condominiumFee: 450,
      iptu: 580,
      yearBuilt: 2021,
      userId: wesley.id
    },
    {
      code: 'TE003',
      title: 'Terreno Comercial Alto dos Passos',
      description: 'Terreno comercial em localização estratégica, ideal para construção.',
      type: 'TERRENO' as const,
      transactionType: 'VENDA' as const,
      status: 'DISPONIVEL' as const,
      price: 450000,
      area: 500,
      bedrooms: 0,
      bathrooms: 0,
      parking: 0,
      address: 'Av. Juiz de Fora',
      neighborhood: 'Alto dos Passos',
      city: 'Juiz de Fora',
      state: 'MG',
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'],
      amenities: [],
      featured: false,
      exclusive: false,
      iptu: 280,
      userId: wesley.id
    },
    {
      code: 'AP004',
      title: 'Apartamento 2 Quartos Granbery',
      description: 'Apartamento bem localizado, próximo a comércios e universidades.',
      type: 'APARTAMENTO' as const,
      transactionType: 'ALUGUEL' as const,
      status: 'DISPONIVEL' as const,
      price: 2200,
      area: 75,
      bedrooms: 2,
      bathrooms: 1,
      parking: 1,
      address: 'Rua Oscar Vidal',
      neighborhood: 'Granbery',
      city: 'Juiz de Fora',
      state: 'MG',
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'],
      amenities: ['Elevador', 'Garagem Coberta', 'Área de Serviço'],
      featured: false,
      exclusive: false,
      condominiumFee: 350,
      iptu: 180,
      yearBuilt: 2018,
      userId: wesley.id
    },
    {
      code: 'CO005',
      title: 'Cobertura Duplex Bom Pastor',
      description: 'Cobertura duplex com vista panorâmica, acabamento de luxo e terraço gourmet.',
      type: 'COBERTURA' as const,
      transactionType: 'VENDA' as const,
      status: 'DISPONIVEL' as const,
      price: 1200000,
      area: 280,
      bedrooms: 4,
      bathrooms: 4,
      suites: 2,
      parking: 3,
      address: 'Rua São Sebastião',
      neighborhood: 'Bom Pastor',
      city: 'Juiz de Fora',
      state: 'MG',
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'],
      amenities: ['Terraço Gourmet', 'Jacuzzi', 'Sauna', 'Home Theater', 'Adega'],
      featured: true,
      exclusive: true,
      condominiumFee: 1200,
      iptu: 800,
      yearBuilt: 2023,
      userId: wesley.id
    }
  ]

  for (const property of properties) {
    await prisma.property.upsert({
      where: { code: property.code },
      update: {},
      create: property
    })
    console.log(`✅ Imóvel ${property.code} criado`)
  }

  // Criar alguns leads de exemplo
  const leads = [
    {
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '32999887766',
      source: 'SITE' as const,
      status: 'NOVO' as const,
      message: 'Tenho interesse no apartamento do Centro',
    },
    {
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '32988776655',
      source: 'WHATSAPP' as const,
      status: 'CONTATO_REALIZADO' as const,
      message: 'Gostaria de agendar uma visita na casa em São Mateus',
      userId: wesley.id
    },
    {
      name: 'Pedro Costa',
      email: 'pedro.costa@email.com',
      phone: '32977665544',
      source: 'INDICACAO' as const,
      status: 'VISITA_AGENDADA' as const,
      message: 'Indicado pelo amigo Carlos',
      userId: wesley.id
    }
  ]

  for (const lead of leads) {
    const existingLead = await prisma.lead.findFirst({
      where: { email: lead.email }
    })
    
    if (!existingLead) {
      await prisma.lead.create({ data: lead })
      console.log(`✅ Lead ${lead.name} criado`)
    }
  }

  // Criar algumas tarefas de exemplo
  const tasks = [
    {
      title: 'Ligar para João Silva',
      description: 'Retornar contato sobre apartamento do Centro',
      type: 'LIGACAO' as const,
      priority: 'ALTA' as const,
      status: 'PENDENTE' as const,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
      userId: wesley.id
    },
    {
      title: 'Preparar documentação AP001',
      description: 'Organizar documentos para possível venda',
      type: 'DOCUMENTACAO' as const,
      priority: 'MEDIA' as const,
      status: 'PENDENTE' as const,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
      userId: wesley.id
    }
  ]

  for (const task of tasks) {
    const existingTask = await prisma.task.findFirst({
      where: { title: task.title, userId: task.userId }
    })
    
    if (!existingTask) {
      await prisma.task.create({ data: task })
      console.log(`✅ Tarefa "${task.title}" criada`)
    }
  }

  console.log('🎉 Seed concluído com sucesso!')
  console.log('')
  console.log('📧 Usuários criados:')
  console.log('   Admin: admin@gomesnoronha.com.br / admin123')
  console.log('   Wesley: wesley@gomesnoronha.com.br / wesley123')
  console.log('   Claudio: claudio@gomesnoronha.com.br / claudio123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
