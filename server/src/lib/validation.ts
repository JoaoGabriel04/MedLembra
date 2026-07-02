import { z, ZodError, ZodIssue } from 'zod'

export const zIntParam = z.coerce.number().int().positive()

function traduzirIssue(issue: ZodIssue): string {
  switch (issue.code) {
    case 'invalid_type': {
      const received = (issue as unknown as { received: string }).received
      if (received === 'undefined' || received === 'null') return 'campo obrigatório'
      const expected = (issue as unknown as { expected: string }).expected
      return `tipo inválido: esperado ${expected}, recebido ${received}`
    }
    case 'too_small': {
      const i = issue as unknown as { origin: string; minimum: number }
      if (i.origin === 'string') {
        if (i.minimum === 1) return 'não pode ser vazio'
        return `deve ter pelo menos ${i.minimum} caractere(s)`
      }
      if (i.origin === 'number') return `deve ser no mínimo ${i.minimum}`
      if (i.origin === 'array') return `deve ter pelo menos ${i.minimum} item(ns)`
      return `valor muito pequeno (mínimo: ${i.minimum})`
    }
    case 'too_big': {
      const i = issue as unknown as { maximum: number }
      return `valor muito grande (máximo: ${i.maximum})`
    }
    case 'invalid_format': {
      const i = issue as unknown as { format: string }
      if (i.format === 'email') return 'formato de e-mail inválido'
      return issue.message
    }
    case 'invalid_value': {
      const i = issue as unknown as { values: string[] }
      return `deve ser um de: ${i.values.join(', ')}`
    }
    case 'custom':
      return issue.message
    default:
      return issue.message
  }
}

export function zodErrorResponse(err: ZodError): object {
  const bodyIssue = err.issues.find(i => i.code === 'invalid_type' && i.path.length === 0)
  if (bodyIssue) {
    return {
      error: 'VALIDATION_ERROR',
      message: 'Corpo da requisição ausente ou não é um objeto JSON válido'
    }
  }

  const campos: Record<string, string[]> = {}
  const erros: string[] = []

  for (const issue of err.issues) {
    if (issue.path.length === 0) {
      erros.push(traduzirIssue(issue))
    } else {
      const field = issue.path.join('.')
      if (!campos[field]) campos[field] = []
      campos[field].push(traduzirIssue(issue))
    }
  }

  const body: Record<string, unknown> = {
    error: 'VALIDATION_ERROR',
    message: 'Dados inválidos'
  }
  if (Object.keys(campos).length > 0) body.campos = campos
  if (erros.length > 0) body.erros = erros

  return body
}
