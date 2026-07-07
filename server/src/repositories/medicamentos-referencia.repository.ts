import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export async function buscar(q: string, limit = 5): Promise<string[]> {
  const pattern = `%${q}%`
  const startPattern = `${q.toUpperCase()}%`

  const rows = await prisma.$queryRaw<{ nome: string; sort_key: number }[]>(
    Prisma.sql`
      SELECT DISTINCT nome,
        CASE WHEN UPPER(nome) LIKE ${startPattern} THEN 0 ELSE 1 END AS sort_key
      FROM medicamentos_referencia
      WHERE nome ILIKE ${pattern}
      ORDER BY sort_key, nome ASC
      LIMIT ${limit}
    `
  )

  return rows.map(r => r.nome)
}
