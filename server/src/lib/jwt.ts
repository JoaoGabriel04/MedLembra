import jwt from 'jsonwebtoken'

export type JwtPayload = {
  sub: number
  tipo: 'IDOSO' | 'CUIDADOR'
}

const SECRET = process.env.JWT_SECRET!
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as unknown as JwtPayload
}
