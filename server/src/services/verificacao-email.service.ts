import { AppError } from '../lib/errors'
import { signToken } from '../lib/jwt'
import * as usuariosRepo from '../repositories/usuarios.repository'
import * as codigosRepo from '../repositories/codigos-verificacao.repository'
import { enviarCodigoVerificacao } from './email.service'

interface UsuarioAuth {
  id: number
  nome: string
  email: string
  tipo: import('@prisma/client').TipoUsuario
}

function gerarCodigo(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function expiraEm15min(): Date {
  return new Date(Date.now() + 15 * 60 * 1000)
}

export async function gerarEEnviarCodigo(usuarioId: number, email: string, nome: string): Promise<void> {
  await codigosRepo.deletarPorUsuario(usuarioId)
  const codigo = gerarCodigo()
  await codigosRepo.criar(usuarioId, codigo, expiraEm15min())
  await enviarCodigoVerificacao({ email, nome, codigo })
}

export async function verificarCodigo(email: string, codigo: string): Promise<{ token: string; usuario: UsuarioAuth }> {
  const usuario = await usuariosRepo.findByEmail(email)
  if (!usuario) throw new AppError(404, 'USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado')
  if (usuario.emailVerificado) throw new AppError(409, 'JA_VERIFICADO', 'E-mail já verificado')

  const registro = await codigosRepo.findValido(usuario.id, codigo)
  if (!registro) throw new AppError(400, 'CODIGO_INVALIDO', 'Código inválido ou expirado')

  await codigosRepo.marcarUsado(registro.id)
  await usuariosRepo.setEmailVerificado(usuario.id)

  const token = signToken({ sub: usuario.id, tipo: usuario.tipo })
  return {
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }
  }
}

export async function reenviarCodigo(email: string): Promise<void> {
  const usuario = await usuariosRepo.findByEmail(email)
  if (!usuario) throw new AppError(404, 'USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado')
  if (usuario.emailVerificado) throw new AppError(409, 'JA_VERIFICADO', 'E-mail já verificado')
  await gerarEEnviarCodigo(usuario.id, usuario.email, usuario.nome)
}
