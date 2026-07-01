import { TipoUsuario } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { hashSenha, compareSenha } from '../lib/bcrypt'
import { signToken } from '../lib/jwt'
import { AppError } from '../lib/errors'

interface RegisterInput {
  nome: string
  email: string
  senha: string
  tipo: TipoUsuario
}

interface LoginInput {
  email: string
  senha: string
}

interface AuthResult {
  token: string
  usuario: {
    id: number
    nome: string
    email: string
    tipo: TipoUsuario
  }
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.usuario.findUnique({ where: { email: input.email } })
  if (existing) {
    throw new AppError(409, 'EMAIL_DUPLICADO', 'Email já cadastrado')
  }

  const hash = await hashSenha(input.senha)
  const usuario = await prisma.usuario.create({
    data: {
      nome: input.nome,
      email: input.email,
      senha: hash,
      tipo: input.tipo
    }
  })

  const token = signToken({ sub: usuario.id, tipo: usuario.tipo })
  return {
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }
  }
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const usuario = await prisma.usuario.findUnique({ where: { email: input.email } })
  if (!usuario) {
    throw new AppError(401, 'CREDENCIAIS_INVALIDAS', 'Credenciais inválidas')
  }

  const valid = await compareSenha(input.senha, usuario.senha)
  if (!valid) {
    throw new AppError(401, 'CREDENCIAIS_INVALIDAS', 'Credenciais inválidas')
  }

  const token = signToken({ sub: usuario.id, tipo: usuario.tipo })
  return {
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }
  }
}
