import jwt from 'jsonwebtoken'

export type JwtPayload = {
  sub: number
  tipo: 'IDOSO' | 'CUIDADOR'
}

function secret(): string {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET not configured')
  return s
}

export function signToken(payload: JwtPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn']
  return jwt.sign(payload, secret(), { expiresIn })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, secret()) as unknown as JwtPayload
}
