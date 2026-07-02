export interface MedParaAlerta {
  id: number
  nome: string
  estoqueAtual: number
  frequenciaDiaria: number
  dataValidade: Date
}

export interface AlertaEstoqueBaixo {
  tipo: 'ESTOQUE_BAIXO'
  medicamentoId: number
  medicamentoNome: string
  diasRestantes: number
}

export interface AlertaValidadeProxima {
  tipo: 'VALIDADE_PROXIMA'
  medicamentoId: number
  medicamentoNome: string
  diasParaVencer: number
  dataValidade: string
}

export type Alerta = AlertaEstoqueBaixo | AlertaValidadeProxima

export function calcularAlertas(medicamentos: MedParaAlerta[]): Alerta[] {
  const hojeMs = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  )

  const alertas: Alerta[] = []

  for (const med of medicamentos) {
    const diasRestantes = Math.floor(med.estoqueAtual / med.frequenciaDiaria)
    if (diasRestantes <= 7) {
      alertas.push({
        tipo: 'ESTOQUE_BAIXO',
        medicamentoId: med.id,
        medicamentoNome: med.nome,
        diasRestantes
      })
    }

    const validadeMs = med.dataValidade.getTime()
    const diasParaVencer = Math.ceil((validadeMs - hojeMs) / (1000 * 60 * 60 * 24))
    if (diasParaVencer <= 30) {
      alertas.push({
        tipo: 'VALIDADE_PROXIMA',
        medicamentoId: med.id,
        medicamentoNome: med.nome,
        diasParaVencer,
        dataValidade: med.dataValidade.toISOString().slice(0, 10)
      })
    }
  }

  return alertas
}
