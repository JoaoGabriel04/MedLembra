import bcrypt from 'bcryptjs'

const ROUNDS = 10

export function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, ROUNDS)
}

export function compareSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash)
}
