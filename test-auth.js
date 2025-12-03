const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Buscando usuários...')
  
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, active: true, password: true }
  })
  
  console.log(`\n${users.length} usuários encontrados:\n`)
  
  const testPasswords = {
    'admin@gomesnoronha.com.br': 'admin123',
    'wesley@gomesnoronha.com.br': 'wesley123',
    'claudio@gomesnoronha.com.br': 'claudio123'
  }
  
  for (const user of users) {
    console.log(`Email: ${user.email}`)
    console.log(`  Nome: ${user.name}`)
    console.log(`  Role: ${user.role}`)
    console.log(`  Ativo: ${user.active}`)
    
    const testPwd = testPasswords[user.email]
    if (testPwd) {
      const isValid = await bcrypt.compare(testPwd, user.password)
      console.log(`  Senha '${testPwd}' válida: ${isValid ? '✅ SIM' : '❌ NÃO'}`)
    }
    console.log('')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
