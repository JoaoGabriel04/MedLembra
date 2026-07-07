import https from 'https'
import { prisma } from './prisma'

const CSV_URL = 'https://dados.anvisa.gov.br/dados/CONSULTAS/PRODUTOS/TA_CONSULTA_MEDICAMENTOS.CSV'
const NOME_COL = 6
const BATCH_SIZE = 500

function limpar(field: string): string {
  return field.trim().replace(/^"|"$/g, '').trim()
}

function baixarNomes(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    https.get(CSV_URL, { rejectUnauthorized: false }, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} ao baixar CSV da ANVISA`))
        return
      }

      const nomes = new Set<string>()
      let buffer = ''
      let isHeader = true

      res.setEncoding('latin1')

      res.on('data', (chunk: string) => {
        buffer += chunk
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (isHeader) { isHeader = false; continue }
          const fields = line.split(';')
          if (fields.length <= NOME_COL) continue
          const nome = limpar(fields[NOME_COL])
          if (nome.length >= 2) nomes.add(nome.toUpperCase())
        }
      })

      res.on('end', () => {
        if (buffer.trim()) {
          const fields = buffer.split(';')
          if (fields.length > NOME_COL) {
            const nome = limpar(fields[NOME_COL])
            if (nome.length >= 2) nomes.add(nome.toUpperCase())
          }
        }
        resolve(Array.from(nomes).sort())
      })

      res.on('error', reject)
    }).on('error', reject)
  })
}

export async function seedMedicamentosAnvisa(): Promise<void> {
  console.log('[seed] Baixando CSV da ANVISA...')
  const nomes = await baixarNomes()
  console.log(`[seed] Nomes únicos: ${nomes.length}`)

  await prisma.medicamentoReferencia.deleteMany({})

  let total = 0
  for (let i = 0; i < nomes.length; i += BATCH_SIZE) {
    const batch = nomes.slice(i, i + BATCH_SIZE).map(nome => ({ nome }))
    await prisma.medicamentoReferencia.createMany({ data: batch })
    total += batch.length
    if (total % 5000 === 0 || total === nomes.length) {
      console.log(`[seed]   ${total}/${nomes.length}`)
    }
  }

  console.log('[seed] Concluído!')
}

export async function seedMedicamentosSeVazio(): Promise<void> {
  const count = await prisma.medicamentoReferencia.count()
  if (count > 0) return
  console.log('[seed] Tabela medicamentos_referencia vazia — iniciando seed da ANVISA...')
  await seedMedicamentosAnvisa()
}
