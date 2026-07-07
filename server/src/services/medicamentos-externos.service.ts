interface ResultadoExterno {
  nome: string
  dosagemSugerida: string | null
}

interface CacheEntry {
  resultados: ResultadoExterno[]
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const TTL_MS = 60 * 60 * 1000 // 1 hour

function extrairDosagem(texto: string): string | null {
  const match = texto.match(/\b(\d+(?:[.,]\d+)?\s*(?:mg|mcg|ml|g|iu|meq))\b/i)
  return match ? match[1].toLowerCase().replace(/\s+/, '') : null
}

export async function buscarMedicamentosExternos(q: string): Promise<ResultadoExterno[]> {
  const chave = q.toLowerCase().trim()

  const cached = cache.get(chave)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.resultados
  }

  const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${encodeURIComponent(chave)}*&limit=5`

  let data: unknown
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (res.status === 404) {
      // openFDA returns 404 when no results found — not an error
      const resultados: ResultadoExterno[] = []
      cache.set(chave, { resultados, expiresAt: Date.now() + TTL_MS })
      return resultados
    }
    if (!res.ok) throw new Error(`openFDA status ${res.status}`)
    data = await res.json()
  } catch (err) {
    throw Object.assign(new Error('Falha ao consultar API externa'), { statusCode: 502 })
  }

  const results = (data as { results?: unknown[] }).results ?? []

  const resultados: ResultadoExterno[] = results.map((item) => {
    const openfda = (item as { openfda?: { brand_name?: string[] } }).openfda ?? {}
    const nome = openfda.brand_name?.[0] ?? 'Desconhecido'
    return { nome, dosagemSugerida: extrairDosagem(nome) }
  })

  cache.set(chave, { resultados, expiresAt: Date.now() + TTL_MS })
  return resultados
}
