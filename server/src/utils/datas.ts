const FORTALEZA_OFFSET_MS = -3 * 60 * 60 * 1000

function agoraEmFortaleza(): Date {
  return new Date(Date.now() + FORTALEZA_OFFSET_MS)
}

export function getHojeFortaleza(): { inicio: Date; fim: Date; dataStr: string } {
  const em = agoraEmFortaleza()
  const ano = em.getUTCFullYear()
  const mes = em.getUTCMonth()
  const dia = em.getUTCDate()
  // meia-noite em Fortaleza (UTC-3) = 03:00 UTC
  const inicio = new Date(Date.UTC(ano, mes, dia, 3, 0, 0))
  const fim = new Date(Date.UTC(ano, mes, dia + 1, 3, 0, 0))
  const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  return { inicio, fim, dataStr }
}

export function getInicio7DiasFortaleza(): Date {
  const em = agoraEmFortaleza()
  const ano = em.getUTCFullYear()
  const mes = em.getUTCMonth()
  const dia = em.getUTCDate()
  // 6 dias atrás para incluir hoje = janela de 7 dias
  return new Date(Date.UTC(ano, mes, dia - 6, 3, 0, 0))
}

export function getInicioNDiasFortaleza(n: number): Date {
  const em = agoraEmFortaleza()
  const ano = em.getUTCFullYear()
  const mes = em.getUTCMonth()
  const dia = em.getUTCDate()
  return new Date(Date.UTC(ano, mes, dia - (n - 1), 3, 0, 0))
}
