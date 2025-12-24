import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gomesnoronha.com.br' },
    update: {},
    create: {
      email: 'admin@gomesnoronha.com.br',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '(11) 99999-9999',
      creci: '12345-F',
    },
  })

  console.log('✅ Usuário admin criado:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
