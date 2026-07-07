import { TipoUsuario } from '@prisma/client'
import { hashSenha, compareSenha } from '../lib/bcrypt'
import { signToken } from '../lib/jwt'
import { AppError } from '../lib/errors'
import * as usuariosRepo from '../repositories/usuarios.repository'
import { gerarEEnviarCodigo } from './verificacao-email.service'

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

interface UsuarioAuth {
  id: number
  nome: string
  email: string
  tipo: TipoUsuario
}

export interface RegisterResult {
  message: string
  email: string
}

export interface LoginVerificado {
  emailVerificado: true
  token: string
  usuario: UsuarioAuth
}

export interface LoginNaoVerificado {
  emailVerificado: false
  email: string
}

export type LoginResult = LoginVerificado | LoginNaoVerificado

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const existing = await usuariosRepo.findByEmail(input.email)
  if (existing) {
    throw new AppError(409, 'EMAIL_DUPLICADO', 'Email já cadastrado')
  }

  const hash = await hashSenha(input.senha)
  const usuario = await usuariosRepo.create({
    nome: input.nome,
    email: input.email,
    senhaHash: hash,
    tipo: input.tipo
  })

  await gerarEEnviarCodigo(usuario.id, usuario.email, usuario.nome)

  return {
    message: 'Cadastro realizado. Verifique seu e-mail para ativar a conta.',
    email: usuario.email
  }
}

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const usuario = await usuariosRepo.findByEmail(input.email)
  if (!usuario) {
    throw new AppError(401, 'CREDENCIAIS_INVALIDAS', 'Credenciais inválidas')
  }

  const valid = await compareSenha(input.senha, usuario.senhaHash)
  if (!valid) {
    throw new AppError(401, 'CREDENCIAIS_INVALIDAS', 'Credenciais inválidas')
  }

  if (!usuario.emailVerificado) {
    return { emailVerificado: false, email: usuario.email }
  }

  const token = signToken({ sub: usuario.id, tipo: usuario.tipo })
  return {
    emailVerificado: true,
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }
  }
}
