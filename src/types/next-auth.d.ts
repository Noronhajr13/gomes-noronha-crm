import 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    id: string
    role: Role
    avatar?: string | null
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: string
      avatar?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    avatar?: string | null
  }
}
