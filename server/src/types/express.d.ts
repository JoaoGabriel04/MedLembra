declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        tipo: 'IDOSO' | 'CUIDADOR'
      }
    }
  }
}

export {}
